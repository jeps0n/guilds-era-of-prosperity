import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { calculateLargestArmy } from "./calculateLargestArmy";
/**
 * Update Largest Army ownership.
 *
 * Rules handled here:
 * - A player must have at least 3 played Knights to qualify.
 * - The first player to reach 3+ Knights claims Largest Army.
 * - The current holder keeps Largest Army when another player ties
 *   their Knight count.
 * - A player must strictly exceed the current holder to take it.
 * - The award is worth 2 VP.
 */
export function updateLargestArmy(
    game: GameState
): GameState {
    const armyCounts = game.players.map(
        (player) => ({
            playerId: player.id,
            count: calculateLargestArmy(
                game,
                player.id
            ),
        })
    );
    const qualifyingPlayers =
        armyCounts.filter(
            (entry) => entry.count >= 3
        );
    if (qualifyingPlayers.length === 0) {
        return game;
    }
    const currentHolderId =
        game.largestArmyPlayerId;
    /*
     * No current holder.
     *
     * In normal sequential gameplay, the first player
     * to reach 3 Knights claims Largest Army.
     */
    if (!currentHolderId) {
        const qualifyingLeader =
            qualifyingPlayers.reduce(
                (leader, entry) =>
                    entry.count > leader.count
                        ? entry
                        : leader
            );
        return transferLargestArmy(
            game,
            undefined,
            qualifyingLeader.playerId
        );
    }
    const currentHolderCount =
        armyCounts.find(
            (entry) =>
                entry.playerId ===
                currentHolderId
        )?.count ?? 0;
    const challenger =
        armyCounts.reduce(
            (leader, entry) =>
                entry.count > leader.count
                    ? entry
                    : leader
        );
    /*
     * The current holder keeps Largest Army
     * when another player only ties them.
     */
    if (
        challenger.count <=
        currentHolderCount
    ) {
        return game;
    }
    return transferLargestArmy(
        game,
        currentHolderId,
        challenger.playerId
    );
}
/**
 * Transfer Largest Army from one player to another.
 */
function transferLargestArmy(
    game: GameState,
    previousHolderId: string | undefined,
    newHolderId: string
): GameState {
    if (
        previousHolderId === newHolderId
    ) {
        return game;
    }
    const updatedPlayers =
        game.players.map(
            (player) => {
                if (
                    player.id ===
                    previousHolderId
                ) {
                    return {
                        ...player,
                        vp: Math.max(
                            0,
                            player.vp - 2
                        ),
                    };
                }
                if (
                    player.id ===
                    newHolderId
                ) {
                    return {
                        ...player,
                        vp:
                            player.vp + 2,
                    };
                }
                return player;
            }
        );
    const newHolder =
        updatedPlayers.find(
            (player) =>
                player.id ===
                newHolderId
        );
    if (!newHolder) {
        return game;
    }
    const previousHolder = previousHolderId
        ? game.players.find(
            (player) =>
                player.id === previousHolderId
        )
        : undefined;
    return {
        ...game,
        players: updatedPlayers,
        largestArmyPlayerId:
            newHolderId,
        eventLog: [
            ...game.eventLog,
            ...(previousHolder
                ? [
                    createEvent(
                        "LARGEST_ARMY_CLAIMED",
                        `${previousHolder.name} lost Largest Army. (-2 VP)`
                    ),
                    createEvent(
                        "LARGEST_ARMY_CLAIMED",
                        `${newHolder.name} took Largest Army from ${previousHolder.name}. (+2 VP)`
                    ),
                ]
                : [
                    createEvent(
                        "LARGEST_ARMY_CLAIMED",
                        `${newHolder.name} claimed Largest Army. (+2 VP)`
                    ),
                ]),
        ],
    };
}