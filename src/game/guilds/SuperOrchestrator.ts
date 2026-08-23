import { GUILDS } from "../data/guilds";
import type { GuildType, Resources } from "../engine/types";
import type { GameState } from "../engine/GameState";
import { resolveSuper } from "./resolveSuper";
import {
    getMarketInsightCards,
    resolveMarketInsight,
} from "./merchant/super/marketInsightSuper";
import {
    getGrandExpedition,
    resolveGrandExpedition,
    type GrandExpeditionModel,
} from "./explorer/super/grandExpeditionSuper";
import {
    getMasterBuilder,
    resolveMasterBuilder,
    type MasterBuilderModel,
    type MasterBuilderSelection,
} from "./builder/super/masterBuilderSuper";
import { createEvent } from "../engine/createEvent";
export interface SuperButtonModel {
    id: string;
    resource: keyof Resources;
    label: string;
    disabled: boolean;
    active: boolean;
}
export class SuperOrchestrator {
    private selectedButtons: Set<string> = new Set();
    private selectedMarketInsightCards: Set<string> =
        new Set();
    private selectedMasterBuilderBuilding:
        MasterBuilderSelection | undefined;
    static getSuperTitle(guild: GuildType): string {
        const guildData = GUILDS.find(
            (guildData) => guildData.type === guild
        );
        return guildData?.superName ?? "SUPER MENU";
    }
    getSuperButtons(
        game: GameState
    ): SuperButtonModel[] {
        const resources: (keyof Resources)[] = [
            "brick",
            "lumber",
            "wheat",
            "sheep",
            "ore",
        ];
        return resources.flatMap((resource) => {
            const bankCount =
                game.resourceBank[resource];
            return [1, 2, 3].map((slot) => ({
                id: `${resource}-${slot}`,
                resource,
                label: resource,
                disabled: bankCount < slot,
                active: this.selectedButtons.has(
                    `${resource}-${slot}`
                ),
            }));
        });
    }
    toggleButton(buttonId: string): void {
        if (this.selectedButtons.has(buttonId)) {
            this.selectedButtons.delete(buttonId);
            return;
        }
        if (this.selectedButtons.size >= 3) {
            return;
        }
        this.selectedButtons.add(buttonId);
    }
    getSelectedButtons(): string[] {
        return Array.from(this.selectedButtons);
    }
    getMarketInsightCards(
        game: GameState
    ): MarketInsightCardModel[] {
        return getMarketInsightCards(game).map(
            (card) => ({
                id: card.id,
                type: card.type,
                active:
                    this.selectedMarketInsightCards.has(
                        card.id
                    ),
            })
        );
    }
    getGrandExpedition(
        game: GameState
    ): GrandExpeditionModel {
        return getGrandExpedition(game);
    }
    getMasterBuilder(
        game: GameState
    ): MasterBuilderModel {
        return getMasterBuilder(game);
    }
    toggleMarketInsightCard(
        cardId: string
    ): void {
        if (
            this.selectedMarketInsightCards.has(
                cardId
            )
        ) {
            this.selectedMarketInsightCards.delete(
                cardId
            );
            return;
        }
        if (
            this.selectedMarketInsightCards.size >= 2
        ) {
            return;
        }
        this.selectedMarketInsightCards.add(
            cardId
        );
    }
    toggleMasterBuilderSelection(
        selection: MasterBuilderSelection
    ): void {
        if (
            this.selectedMasterBuilderBuilding ===
            selection
        ) {
            this.selectedMasterBuilderBuilding =
                undefined;
            return;
        }
        this.selectedMasterBuilderBuilding =
            selection;
    }
    getSelectedMarketInsightCards(): string[] {
        return Array.from(
            this.selectedMarketInsightCards
        );
    }
    getSelectedMasterBuilder():
        MasterBuilderSelection | undefined {
        return this.selectedMasterBuilderBuilding;
    }
    resetSelections(): void {
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
        this.selectedMasterBuilderBuilding =
            undefined;
    }
    canConfirmSuper(game: GameState): boolean {
        const player = game.players.find(
            (candidate) =>
                candidate.id === game.currentPlayerId
        );
        if (!player) {
            return false;
        }
        const selectedResources =
            this.selectedButtons.size;
        /*
         * -----------------------------------------
         * MERCHANT
         * -----------------------------------------
         *
         * 3+ cards:
         *   exactly 2 must be selected.
         *
         * 1–2 cards:
         *   cards are automatically taken.
         *
         * 0 cards:
         *   resources are mandatory.
         */
        if (player.guild === "merchant") {
            const availableCards =
                getMarketInsightCards(game);
            if (availableCards.length >= 3) {
                return (
                    this.selectedMarketInsightCards
                        .size === 2
                );
            }
            if (availableCards.length > 0) {
                return true;
            }
            return selectedResources > 0;
        }
        /*
         * -----------------------------------------
         * EXPLORER
         * -----------------------------------------
         *
         * Legal roads:
         *   Grand Expedition is mandatory.
         *   Resources are optional.
         *
         * No legal roads:
         *   resources are mandatory.
         */
        if (player.guild === "explorer") {
            const grandExpedition =
                getGrandExpedition(game);
            if (
                grandExpedition.roadsToPlace > 0
            ) {
                return true;
            }
            return selectedResources > 0;
        }
        /*
         * -----------------------------------------
         * BUILDER
         * -----------------------------------------
         *
         * Legal city/settlement:
         *   one legal building must be selected.
         *   Resources are optional.
         *
         * No legal building:
         *   resources are mandatory.
         */
        if (player.guild === "builder") {
            const masterBuilder =
                getMasterBuilder(game);
            if (
                this.selectedMasterBuilderBuilding ===
                "city"
            ) {
                return masterBuilder.canBuildCity;
            }
            if (
                this.selectedMasterBuilderBuilding ===
                "settlement"
            ) {
                return masterBuilder.canBuildSettlement;
            }
            /*
             * No building is selected.
             *
             * If either building is legally available,
             * the player must choose one.
             */
            if (
                masterBuilder.canBuildCity ||
                masterBuilder.canBuildSettlement
            ) {
                return false;
            }
            /*
             * No legal building exists.
             * Resources become the required
             * consolation transaction.
             */
            return selectedResources > 0;
        }
        /*
         * No recognized guild.
         */
        return false;
    }
    confirmSuper(game: GameState): GameState {
        const player = game.players.find(
            (candidate) =>
                candidate.id === game.currentPlayerId
        );
        if (!player) {
            return game;
        }
        /*
         * -----------------------------------------
         * RESOURCE SELECTION
         * -----------------------------------------
         */
        const selectedResources =
            Array.from(
                this.selectedButtons
            ).map((buttonId) => {
                const [resource] =
                    buttonId.split("-");
                return resource as keyof Resources;
            });
        /*
         * -----------------------------------------
         * CONFIRMATION GUARD
         * -----------------------------------------
         *
         * Keep the final confirmation rule in one
         * place. Nothing proceeds unless the Super
         * has a meaningful legal outcome.
         */
        if (!this.canConfirmSuper(game)) {
            return game;
        }
        let nextGame = game;
        /*
         * -----------------------------------------
         * MERCHANT TRANSACTION
         * -----------------------------------------
         *
         * Merchant's card action is the mandatory
         * finisher when cards exist.
         *
         * If fewer than 3 cards exist, the resolver
         * automatically takes all available cards.
         */
        if (player.guild === "merchant") {
            const availableCards =
                getMarketInsightCards(nextGame);
            let selectedCardIds =
                this.getSelectedMarketInsightCards();
            if (availableCards.length < 3) {
                selectedCardIds = [];
            }
            if (availableCards.length > 0) {
                const marketGame =
                    resolveMarketInsight(
                        nextGame,
                        game.currentPlayerId,
                        selectedCardIds
                    );
                if (marketGame === nextGame) {
                    return game;
                }
                nextGame = marketGame;
            }
        }
        /*
         * -----------------------------------------
         * EXPLORER TRANSACTION
         * -----------------------------------------
         *
         * If a legal road exists, Grand Expedition
         * MUST establish the pending road-placement
         * interaction.
         *
         * Resources remain optional.
         */
        if (player.guild === "explorer") {
            const grandExpedition =
                getGrandExpedition(nextGame);
            if (
                grandExpedition.roadsToPlace > 0
            ) {
                const expeditionGame =
                    resolveGrandExpedition(
                        nextGame,
                        game.currentPlayerId
                    );
                if (
                    expeditionGame === nextGame
                ) {
                    return game;
                }
                nextGame = expeditionGame;
            }
        }
        /*
         * -----------------------------------------
         * BUILDER TRANSACTION
         * -----------------------------------------
         *
         * If a legal building exists, the selected
         * city/settlement MUST establish the pending
         * board interaction.
         *
         * Resources remain optional.
         */
        if (
            player.guild === "builder" &&
            this.selectedMasterBuilderBuilding !==
            undefined
        ) {
            const builderGame =
                resolveMasterBuilder(
                    nextGame,
                    game.currentPlayerId,
                    this.selectedMasterBuilderBuilding
                );
            if (builderGame === nextGame) {
                return game;
            }
            nextGame = builderGame;
        }
        /*
         * -----------------------------------------
         * RESOURCE TRANSACTION
         * -----------------------------------------
         *
         * Resources are resolved AFTER the guild
         * finisher.
         *
         * This is intentional:
         *
         *   FINISHER = mandatory when available
         *   RESOURCES = optional when finisher exists
         *   RESOURCES = mandatory when no finisher exists
         */
        if (selectedResources.length > 0) {
            const resourceGame = resolveSuper(
                nextGame,
                game.currentPlayerId,
                selectedResources
            );
            if (resourceGame === nextGame) {
                return game;
            }
            const resourceCounts =
                selectedResources.reduce(
                    (counts, resource) => {
                        counts[resource] =
                            (counts[resource] ?? 0) + 1;
                        return counts;
                    },
                    {} as Partial<
                        Record<
                            keyof Resources,
                            number
                        >
                    >
                );
            const superUsedEvent = [
                ...Array.from(
                    { length: this.selectedMarketInsightCards.size },
                    () =>
                        createEvent(
                            "DEVELOPMENT_CARD_GAINED",
                            `${player.name} received a development card using Market Insight.`
                        )
                ),
            ];
            const currentGuild = GUILDS.find(
                (guildData) =>
                    guildData.type === player.guild
            );
            const resourceSummary =
                (
                    Object.entries(
                        resourceCounts
                    ) as [
                        keyof Resources,
                        number
                    ][]
                )
                    .map(
                        ([resource, count]) =>
                            `[${resource}] ${count}`
                    )
                    .join(", ");
            nextGame = {
                ...resourceGame,
                eventLog: [
                    ...resourceGame.eventLog,
                    createEvent(
                        "RESOURCES_COLLECTED",
                        `${player.name} received ${resourceSummary} from ${currentGuild?.superName ?? " Guild Super"}.`
                    ),
                    ...(player.guild === "merchant"
                        ? superUsedEvent
                        : []),
                ],
            };
        }
        /*
         * -----------------------------------------
         * MEANINGFUL TRANSACTION
         * -----------------------------------------
         *
         * At this point either:
         *
         *   1. a guild finisher was established, or
         *   2. resources were transferred.
         *
         * If neither happened, do not consume the
         * Super.
         */
        if (nextGame === game) {
            return game;
        }
        /*
         * -----------------------------------------
         * SUPER CONSUMPTION
         * -----------------------------------------
         *
         * The orchestrator owns consumption because
         * it coordinates the entire Super transaction.
         */
        nextGame = {
            ...nextGame,
            players: nextGame.players.map(
                (candidate) =>
                    candidate.id ===
                        game.currentPlayerId
                        ? {
                            ...candidate,
                            superUsed: true,
                        }
                        : candidate
            ),
        };
        /*
         * Clear all UI selections after a successful
         * Super transaction.
         */
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
        this.selectedMasterBuilderBuilding =
            undefined;
        return nextGame;
    }
}
export interface MarketInsightCardModel {
    id: string;
    type: string;
    active: boolean;
}