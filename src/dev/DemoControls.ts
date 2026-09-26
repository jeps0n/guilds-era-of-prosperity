import type { GameState } from "../game/engine/GameState";
import type { Resources } from "../game/engine/types";
import { evaluateMilestones } from "../game/systems/milestones/evaluateMilestones";
export class DemoControls {
    // ─────────────────────────────────────────────
    // Demo Controls - Guards / Helpers
    // ─────────────────────────────────────────────
    private static isEditable(game: GameState): boolean {
        return !(
            game.phase === "game_over" ||
            game.phase === "initial_placement"
        );
    }
    private static getPlayer(
        game: GameState,
        playerId: string
    ) {
        return game.players.find((p) => p.id === playerId);
    }
    // ─────────────────────────────────────────────
    // Demo Controls - Resources
    // ─────────────────────────────────────────────
    static readonly resourceMap: Record<
        "1" | "2" | "3" | "4" | "5",
        keyof Resources
    > = {
            "1": "brick",
            "2": "lumber",
            "3": "wheat",
            "4": "sheep",
            "5": "ore",
        };
    static modifyResource(
        game: GameState,
        playerId: string,
        key: "1" | "2" | "3" | "4" | "5",
        modifier: "+" | "=" | "-"
    ): GameState {
        if (!this.isEditable(game)) return game;
        const player = this.getPlayer(game, playerId);
        if (!player) return game;
        const resource = this.resourceMap[key];
        const amount =
            modifier === "+" || modifier === "="
                ? 1
                : -1;
        if (
            amount > 0 &&
            game.resourceBank[resource] <= 0
        ) {
            return game;
        }
        if (
            amount < 0 &&
            player.resources[resource] <= 0
        ) {
            return game;
        }
        return {
            ...game,
            resourceBank: {
                ...game.resourceBank,
                [resource]:
                    game.resourceBank[resource] - amount,
            },
            players: game.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        resources: {
                            ...p.resources,
                            [resource]:
                                p.resources[resource] + amount,
                        },
                    }
                    : p
            ),
        };
    }
    // ─────────────────────────────────────────────
    // Demo Controls - Development Cards
    // ─────────────────────────────────────────────
    static addDevelopmentCard(
        game: GameState,
        playerId: string
    ): GameState {
        if (!this.isEditable(game)) return game;
        const player = this.getPlayer(game, playerId);
        if (!player) return game;
        if (game.developmentDeck.length === 0) {
            return game;
        }
        const [developmentCard, ...remainingDeck] =
            game.developmentDeck;
        const nextGame = {
            ...game,
            developmentDeck: remainingDeck,
            players: game.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        developmentCards: [
                            ...p.developmentCards,
                            developmentCard,
                        ],
                    }
                    : p
            ),
        };
        return developmentCard.type === "victory_point"
            ? this.modifyVictoryPoints(
                nextGame,
                playerId,
                "+"
            )
            : nextGame;
    }
    static removeLastDevelopmentCard(
        game: GameState,
        playerId: string
    ): GameState {
        if (!this.isEditable(game)) return game;
        const player = this.getPlayer(game, playerId);
        if (!player) return game;
        if (player.developmentCards.length === 0) {
            return game;
        }
        const developmentCards = [...player.developmentCards];
        const removedCard = developmentCards.pop()!;
        const nextGame = {
            ...game,
            developmentDeck: [
                removedCard,
                ...game.developmentDeck,
            ],
            players: game.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        developmentCards,
                    }
                    : p
            ),
        };
        return removedCard.type === "victory_point"
            ? this.modifyVictoryPoints(
                nextGame,
                playerId,
                "-"
            )
            : nextGame;
    }
    // ─────────────────────────────────────────────
    //  Demo Controls - Victory Points
    // ─────────────────────────────────────────────
    static modifyVictoryPoints(
        game: GameState,
        playerId: string,
        modifier: "+" | "=" | "-"
    ): GameState {
        if (!this.isEditable(game)) return game;
        const player = this.getPlayer(game, playerId);
        if (!player) return game;
        const amount =
            modifier === "+" || modifier === "="
                ? 1
                : -1;
        if (amount < 0 && player.vp <= 2) {
            return game;
        }
        const nextGame = {
            ...game,
            players: game.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        vp: Math.max(2, p.vp + amount),
                    }
                    : p
            ),
        };
        if (nextGame.players.some((p) => p.vp >= 15)) {
            return evaluateMilestones(nextGame);
        }
        // Demo creates Prosperity.
        if (
            game.era === "standard" &&
            player.vp < 6 &&
            nextGame.players.find(
                (p) => p.id === playerId
            )!.vp >= 6
        ) {
            return {
                ...nextGame,
                era: "prosperity",
                prosperitySourceTurn: -1,
                prosperitySourceVP: Object.fromEntries(
                    nextGame.players.map((p) => [
                        p.id,
                        p.vp,
                    ])
                ),
            };
        }
        // Demo can undo only Demo-created Prosperity,
        // and only when BOTH players are below 6 VP.
        if (
            game.era === "prosperity" &&
            game.prosperitySourceTurn === -1 &&
            nextGame.players.every((p) => p.vp < 6)
        ) {
            return {
                ...nextGame,
                era: "standard",
                prosperitySourceTurn: undefined,
                prosperitySourceVP: undefined,
            };
        }
        return nextGame;
    }
    // ─────────────────────────────────────────────
    // Demo Controls - Secondary (Prosperity) Rolls
    // ─────────────────────────────────────────────
    static modifySecondaryRolls(
        game: GameState,
        playerId: string,
        modifier: "+" | "=" | "-",
        showSecondaryRoll: boolean
    ): GameState {
        if (!this.isEditable(game) || !showSecondaryRoll) return game;
        const player = this.getPlayer(game, playerId);
        if (!player) return game;
        return {
            ...game,
            players: game.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        secondaryRolls:
                            modifier === "+" || modifier === "="
                                ? [1, 2, 3, 4, 5, 6]
                                : [],
                        superUnlocked:
                            modifier === "+" || modifier === "=",
                    }
                    : p
            ),
        };
    }
}
