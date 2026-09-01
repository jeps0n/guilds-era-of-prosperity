import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
export function evaluateMilestones(
    game: GameState
): GameState {
    // 15 VP ends the game immediately.
    const winner = game.players.find(
        (player) => player.vp >= 15
    );
    if (winner) {
        return {
            ...game,
            phase: "game_over",
            winnerId: winner.id,
            eventLog: [
                ...game.eventLog,
                createEvent(
                    "PLAYER_REACHED_15VP",
                    `${winner.name} reached 15 VP.`
                ),
                createEvent(
                    "GAME_ENDED",
                    `${winner.name} won the game!`
                ),
            ],
        };
    }
    // a demo-created Prosperity becomes permanent when a player
    // who was below 6 VP reaches 6 VP through normal gameplay.
    if (
        game.phase === "playing" &&
        game.era === "prosperity" &&
        game.prosperitySourceTurn === -1 &&
        game.prosperitySourceVP
    ) {
        const playerReached6VP = game.players.find(
            (player) =>
                player.vp >= 6 &&
                (game.prosperitySourceVP?.[player.id] ?? 0) < 6
        );
        if (playerReached6VP) {
            return {
                ...game,
                prosperitySourceTurn: game.turnNumber,
                prosperitySourceVP: undefined,
                eventLog: [
                    ...game.eventLog,
                    createEvent(
                        "PLAYER_REACHED_6VP",
                        `${playerReached6VP.name} has reached 6 VP.`
                    ),
                    createEvent(
                        "ERA_STARTED",
                        "The Era of Prosperity has been established."
                    ),
                ],
            };
        }
    }
    // Prosperity begins once any player reaches 6 VP.
    if (
        game.phase === "playing" &&
        game.era === "standard"
    ) {
        const playerReached6VP =
            game.players.find(
                (player) => player.vp >= 6
            );
        if (playerReached6VP) {
            return {
                ...game,
                era: "prosperity",
                eventLog: [
                    ...game.eventLog,
                    createEvent(
                        "PLAYER_REACHED_6VP",
                        `${playerReached6VP.name} has reached 6 VP.`
                    ),
                    createEvent(
                        "ERA_STARTED",
                        "The Era of Prosperity has begun."
                    ),
                ],
            };
        }
    }
    return game;
}