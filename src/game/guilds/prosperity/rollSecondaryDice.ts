import type { GameState } from "../../engine/GameState";
/*
 * Starts the Prosperity secondary-roll phase.
 *
 * This does not roll the die or end the turn.
 * It only puts the game into a waiting state.
 */
export function beginSecondaryRoll(
    game: GameState
): GameState {
    /*
     * Secondary rolls only exist during Prosperity.
     */
    if (game.era !== "prosperity") {
        return game;
    }
    /*
     * Only a playing game can enter this phase.
     */
    if (game.phase !== "playing") {
        return game;
    }
    /*
     * Do not start another roll while one
     * is already waiting to be resolved.
     */
    if (game.secondaryRollPending) {
        return game;
    }
    return {
        ...game,
        secondaryRollPending: true,
        secondaryRoll: undefined,
    };
}
/*
 * Resolves the Prosperity secondary 1D6 roll.
 *
 * This function only changes secondary-roll state.
 * It does not advance the turn.
 */
export function rollSecondaryDice(
    game: GameState
): GameState {
    /*
     * Secondary rolls only exist during Prosperity.
     */
    if (game.era !== "prosperity") {
        return game;
    }
    /*
     * Only an active game can roll.
     */
    if (game.phase !== "playing") {
        return game;
    }
    /*
     * A roll is only valid while the game
     * is waiting for the current player's roll.
     */
    if (!game.secondaryRollPending) {
        return game;
    }
    const currentPlayer =
        game.players.find(
            (player) =>
                player.id ===
                game.currentPlayerId
        );
    if (!currentPlayer) {
        return game;
    }
    /*
     * Generate a 1D6 result.
     */
    const roll =
        Math.floor(Math.random() * 6) + 1;
    const event = {
        id: `secondary-dice-${Date.now()}`,
        type: "SECONDARY_DICE_ROLLED" as const,
        message: `${currentPlayer.name} rolled ${roll} on the Prosperity dice.`,
        timestamp: Date.now(),
    };
    /*
     * Duplicates do not change the collection.
     */
    const alreadyCollected =
        currentPlayer.secondaryRolls.includes(
            roll
        );
    const updatedSecondaryRolls =
        alreadyCollected
            ? currentPlayer.secondaryRolls
            : [
                ...currentPlayer.secondaryRolls,
                roll,
            ].sort(
                (a, b) => a - b
            );
    const completedSet =
        updatedSecondaryRolls.length === 6 &&
        [1, 2, 3, 4, 5, 6].every((number) =>
            updatedSecondaryRolls.includes(number)
        );
    const superJustUnlocked =
        !currentPlayer.superUnlocked &&
        completedSet;
    const unlockEvent =
        superJustUnlocked
            ? {
                id: `super-unlocked-${Date.now()}`,
                type: "SUPER_UNLOCKED" as const,
                message: `${currentPlayer.name} unlocked Guild Super Ability!`,
                timestamp: Date.now(),
            }
            : undefined;
    const updatedPlayers =
        game.players.map((player) => {
            if (
                player.id !==
                currentPlayer.id
            ) {
                return player;
            }
            return {
                ...player,
                secondaryRolls:
                    updatedSecondaryRolls,
                superUnlocked:
                    player.superUnlocked ||
                    superJustUnlocked,
            };
        });
    /*
     * The secondary roll is resolved.
     *
     * The turn remains active here.
     * endTurn() will perform the official
     * turn transition afterward.
     */
    return {
        ...game,
        players: updatedPlayers,
        secondaryRoll: roll,
        secondaryRollPending: false,
        eventLog: unlockEvent
            ? [
                ...game.eventLog,
                event,
                unlockEvent,
            ]
            : [
                ...game.eventLog,
                event,
            ],
    };
}