import { GUILDS } from "../data/guilds";
import type { GuildType, Resources } from "../engine/types";
import type { GameState } from "../engine/GameState";
import { resolveSuper } from "./resolveSuper";
import {
    getMarketInsightCards,
    resolveMarketInsight,
} from "./merchant/super/marketInsightSuper";
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
    getSelectedMarketInsightCards(): string[] {
        return Array.from(
            this.selectedMarketInsightCards
        );
    }
    resetSelections(): void {
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
    }
    // confirmMarketInsight(
    //     game: GameState
    // ): GameState {
    //     const nextGame =
    //         resolveMarketInsight(
    //             game,
    //             game.currentPlayerId,
    //             this.getSelectedMarketInsightCards()
    //         );
    //     if (nextGame !== game) {
    //         this.selectedMarketInsightCards.clear();
    //     }
    //     return nextGame;
    // }
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
        const selectedCards =
            this.selectedMarketInsightCards.size;
        /*
         * Merchant
         */
        if (player.guild === "merchant") {
            const availableCards =
                getMarketInsightCards(game);
            /*
             * Three or more cards:
             * player must explicitly select exactly 2.
             */
            if (availableCards.length >= 3) {
                return (
                    selectedCards === 2
                );
            }
            /*
             * Fewer than 3 cards:
             * available cards are automatically taken.
             *
             * Therefore cards themselves create a
             * meaningful transaction.
             */
            if (availableCards.length > 0) {
                return true;
            }
            /*
             * No cards:
             * resource selection is required.
             */
            return selectedResources > 0;
        }
        /*
         * Builder / Explorer:
         *
         * Their guild-specific action will eventually
         * provide the meaningful transaction.
         *
         * For the resource-only portion currently
         * implemented, at least one resource is require d.
         */
        return selectedResources > 0;
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
         * MERCHANT CARD SELECTION
         * -----------------------------------------
         */
        const availableCards =
            player.guild === "merchant"
                ? getMarketInsightCards(game)
                : [];
        let selectedCardIds =
            this.getSelectedMarketInsightCards();
        /*
         * If fewer than 3 cards exist, the cards
         * are automatically taken. No selection
         * is required.
         */
        if (availableCards.length < 3) {
            selectedCardIds = [];
        }
        /*
         * If 3 cards exist, exactly 2 must be
         * explicitly selected.
         */
        if (
            player.guild === "merchant" &&
            availableCards.length >= 3 &&
            selectedCardIds.length !== 2
        ) {
            return game;
        }
        let nextGame = game;
        /*
         * -----------------------------------------
         * RESOURCE TRANSACTION
         * -----------------------------------------
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
            const resourceCounts = selectedResources.reduce(
                (counts, resource) => {
                    counts[resource] = (counts[resource] ?? 0) + 1;
                    return counts;
                },
                {} as Partial<Record<keyof Resources, number>>
            );
            const resourceSummary = (
                Object.entries(resourceCounts) as [
                    keyof Resources,
                    number
                ][]
            )
                .map(([resource, count]) => `[${resource}] ${count}`)
                .join(", ");
            nextGame = {
                ...resourceGame,
                eventLog: [
                    ...resourceGame.eventLog,
                    createEvent(
                        "SUPER_ACTIVATED",
                        `${player.name} received ${resourceSummary} from Guild Super.`
                    ),
                ],
            };
        }
        /*
         * -----------------------------------------
         * MERCHANT TRANSACTION
         * -----------------------------------------
         */
        if (
            player.guild === "merchant" &&
            availableCards.length > 0
        ) {
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
        /*
         * -----------------------------------------
         * MEANINGFUL TRANSACTION
         * -----------------------------------------
         *
         * At least one resource or development
         * card must actually have been transferred.
         */
        if (nextGame === game) {
            return game;
        }
        /*
         * The orchestrator owns consumption of the
         * Super because it coordinates the entire
         * transaction.
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
        this.selectedButtons.clear();
        this.selectedMarketInsightCards.clear();
        return nextGame;
    }
}
export interface MarketInsightCardModel {
    id: string;
    type: string;
    active: boolean;
}