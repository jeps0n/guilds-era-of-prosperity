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
/* =========================================================
 * SUPER BUTTON MODEL
 * ========================================================= */
export interface SuperButtonModel {
    id: string;
    resource: keyof Resources;
    label: string;
    disabled: boolean;
    active: boolean;
}
/* =========================================================
 * SUPER ORCHESTRATOR
 * ========================================================= */
export class SuperOrchestrator {
    private selectedButtons: Set<string> = new Set();
    private selectedMarketInsightCards: Set<string> =
        new Set();
    private selectedMasterBuilderBuilding:
        MasterBuilderSelection | undefined;
    // Return the Super name for the player's guild.
    static getSuperTitle(guild: GuildType): string {
        const guildData = GUILDS.find(
            (guildData) => guildData.type === guild
        );
        return guildData?.superName ?? "SUPER MENU";
    }
    /* =====================================================
     * SUPER MENU
     * ===================================================== */
    // Build the resource selection buttons.
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
    /* =====================================================
     * RESOURCE SELECTION
     * ===================================================== */
    // Toggle a resource selection.
    toggleButton(buttonId: string): void {
        if (this.selectedButtons.has(buttonId)) {
            this.selectedButtons.delete(buttonId);
            return;
        }
        // Limit resource selections to three.
        if (this.selectedButtons.size >= 3) {
            return;
        }
        this.selectedButtons.add(buttonId);
    }
    // Return the selected resource buttons.
    getSelectedButtons(): string[] {
        return Array.from(this.selectedButtons);
    }
    /* =====================================================
     * GUILD SELECTION
     * ===================================================== */
    // Return Market Insight cards and their selection state.
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
    // Return the current Grand Expedition state.
    getGrandExpedition(
        game: GameState
    ): GrandExpeditionModel {
        return getGrandExpedition(game);
    }
    // Return the current Master Builder state.
    getMasterBuilder(
        game: GameState
    ): MasterBuilderModel {
        return getMasterBuilder(game);
    }
    // Return the automatically assumed Master Builder selection
    // when exactly one building type is legal.
    getAssumedMasterBuilderSelection(
        game: GameState
    ): MasterBuilderSelection | undefined {
        const masterBuilder = getMasterBuilder(game);
        if (
            masterBuilder.canBuildCity &&
            !masterBuilder.canBuildSettlement
        ) {
            return "city";
        }
        if (
            !masterBuilder.canBuildCity &&
            masterBuilder.canBuildSettlement
        ) {
            return "settlement";
        }
        return undefined;
    }
    // Toggle a Market Insight card selection.
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
        // Limit Market Insight selections to two.
        if (
            this.selectedMarketInsightCards.size >= 2
        ) {
            return;
        }
        this.selectedMarketInsightCards.add(
            cardId
        );
    }
    // Toggle the Master Builder building selection.
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
    // Return the selected Market Insight cards.
    getSelectedMarketInsightCards(): string[] {
        return Array.from(
            this.selectedMarketInsightCards
        );
    }
    // Return the selected Master Builder option.
    getSelectedMasterBuilder():
        MasterBuilderSelection | undefined {
        return this.selectedMasterBuilderBuilding;
    }
    // Clear all current Super selections.
    resetSelections(): void {
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
        this.selectedMasterBuilderBuilding =
            undefined;
    }
    /* =====================================================
     * SUPER CONFIRMATION >
     * ===================================================== */
    // Check whether the current Super selection is valid.
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
        /* =================================================
         * > MERCHANT CONFIRM
         * ================================================= */
        if (player.guild === "merchant") {
            const availableCards =
                getMarketInsightCards(game);
            // Three or more cards require exactly two selections.
            if (availableCards.length >= 3) {
                return (
                    this.selectedMarketInsightCards
                        .size === 2
                );
            }
            // One or two cards are taken automatically.
            if (availableCards.length > 0) {
                return true;
            }
            // With no cards, resources are required.
            return selectedResources > 0;
        }
        /* =================================================
         * > EXPLORER CONFIRM
         * ================================================= */
        if (player.guild === "explorer") {
            const grandExpedition =
                getGrandExpedition(game);
            // A legal road makes Grand Expedition mandatory.
            if (
                grandExpedition.roadsToPlace > 0
            ) {
                return true;
            }
            // With no legal roads, resources are required.
            return selectedResources > 0;
        }
        /* =================================================
         * > BUILDER CONFIRM
         * ================================================= */
        if (player.guild === "builder") {
            const masterBuilder =
                getMasterBuilder(game);
            const assumedSelection =
                this.getAssumedMasterBuilderSelection(game);
            const selectedBuilding =
                this.selectedMasterBuilderBuilding ??
                assumedSelection;
            // Confirm the selected city if it is legal.
            if (selectedBuilding === "city") {
                return masterBuilder.canBuildCity;
            }
            // Confirm the selected settlement if it is legal.
            if (selectedBuilding === "settlement") {
                return masterBuilder.canBuildSettlement;
            }
            // Both buildings are legal, so the player must choose.
            if (
                masterBuilder.canBuildCity &&
                masterBuilder.canBuildSettlement
            ) {
                return false;
            }
            // With no legal building, resources are required.
            return selectedResources > 0;
        }
        // Reject an unknown guild.
        return false;
    }
    /* =====================================================
     * SUPER RESOLUTION >
     * ===================================================== */
    // Resolve the selected Super actions.
    confirmSuper(game: GameState): GameState {
        const player = game.players.find(
            (candidate) =>
                candidate.id === game.currentPlayerId
        );
        if (!player) {
            return game;
        }
        // Convert selected button IDs into resource types.
        const selectedResources =
            Array.from(
                this.selectedButtons
            ).map((buttonId) => {
                const [resource] =
                    buttonId.split("-");
                return resource as keyof Resources;
            });
        // Stop if the current selection is not valid.
        if (!this.canConfirmSuper(game)) {
            return game;
        }
        let nextGame = game;
        let marketInsightCardCount = 0;
        /* =================================================
         * > MERCHANT RESOLVE SUPER
         * ================================================= */
        if (player.guild === "merchant") {
            const availableCards =
                getMarketInsightCards(nextGame);
            let selectedCardIds =
                this.getSelectedMarketInsightCards();
            // Fewer than three cards means all available cards are taken.
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
                // Stop if Market Insight failed.
                if (marketGame === nextGame) {
                    return game;
                }
                const updatedPlayer = marketGame.players.find(
                    (candidate) =>
                        candidate.id === game.currentPlayerId
                );
                if (!updatedPlayer) {
                    return game;
                }
                // Track how many development cards were gained.
                marketInsightCardCount =
                    updatedPlayer.developmentCards.length -
                    player.developmentCards.length;
                nextGame = marketGame;
            }
        }
        /* =================================================
         * > EXPLORER RESOLVE SUPER
         * ================================================= */
        if (player.guild === "explorer") {
            const grandExpedition =
                getGrandExpedition(nextGame);
            // A legal road starts the Grand Expedition placement.
            if (
                grandExpedition.roadsToPlace > 0
            ) {
                const expeditionGame =
                    resolveGrandExpedition(
                        nextGame,
                        game.currentPlayerId
                    );
                // Stop if Grand Expedition failed.
                if (
                    expeditionGame === nextGame
                ) {
                    return game;
                }
                nextGame = expeditionGame;
            }
        }
        /* =================================================
         * > BUILDER RESOLVE SUPER
         * ================================================= */
        if (player.guild === "builder") {
            const selectedBuilding =
                this.selectedMasterBuilderBuilding ??
                this.getAssumedMasterBuilderSelection(
                    nextGame
                );
            if (selectedBuilding !== undefined) {
                // Start the selected Master Builder placement.
                const builderGame =
                    resolveMasterBuilder(
                        nextGame,
                        game.currentPlayerId,
                        selectedBuilding
                    );
                // Stop if Master Builder failed.
                if (builderGame === nextGame) {
                    return game;
                }
                nextGame = builderGame;
            }
        }
        /* =================================================
         * RESOURCE TRANSACTION
         * ================================================= */
        if (selectedResources.length > 0) {
            const resourceGame = resolveSuper(
                nextGame,
                game.currentPlayerId,
                selectedResources
            );
            // Stop if the resource transaction failed.
            if (resourceGame === nextGame) {
                return game;
            }
            // Count each selected resource.
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
            const currentGuild = GUILDS.find(
                (guildData) =>
                    guildData.type === player.guild
            );
            // Build the resource event summary.
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
                ],
            };
        }
        /* =================================================
         * MERCHANT EVENTS
         * ================================================= */
        if (
            player.guild === "merchant" &&
            marketInsightCardCount > 0
        ) {
            // Create one event for each development card gained.
            const marketInsightEvents = Array.from(
                { length: marketInsightCardCount },
                () =>
                    createEvent(
                        "DEVELOPMENT_CARD_GAINED",
                        `${player.name} received a Development Card using Market Insight.`
                    )
            );
            nextGame = {
                ...nextGame,
                eventLog: [
                    ...nextGame.eventLog,
                    ...marketInsightEvents,
                ],
            };
        }
        /* =================================================
         * SUPER COMPLETION
         * ================================================= */
        // Do not consume the Super if nothing was resolved.
        if (nextGame === game) {
            return game;
        }
        /* =================================================
         * SUPER CONSUMPTION
         * ================================================= */
        // Mark the player's Super as used.
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
        // Clear all selections after a successful Super.
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
        this.selectedMasterBuilderBuilding =
            undefined;
        return nextGame;
    }
}
/* =========================================================
 * MARKET INSIGHT MODEL
 * ========================================================= */
export interface MarketInsightCardModel {
    id: string;
    type: string;
    active: boolean;
}