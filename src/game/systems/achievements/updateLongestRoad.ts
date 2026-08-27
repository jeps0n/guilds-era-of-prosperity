import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { calculateLongestRoad } from "./calculateLongestRoad";
/**
 * Update Longest Road ownership.
 *
 * Rules handled here:
 * - A player must have at least 5 continuous roads to qualify.
 * - If nobody currently owns Longest Road, a unique leader with 5+
 *   receives it.
 * - If multiple players are tied for the highest qualifying length
 *   and nobody currently owns it, nobody receives it.
 * - The current holder keeps Longest Road when another player ties
 *   their length.
 * - A player must strictly exceed the current holder to take it.
 * - If the current holder falls below 5 and nobody else qualifies,
 *   the award is removed.
 * - The award is worth 2 VP.
 *
 * This function recalculates all players and returns a new GameState.
 */
export function updateLongestRoad(
    game: GameState
): GameState {
    /*
     * ------------------------------------------------------------
     * 1. Calculate every player's current longest road.
     * ------------------------------------------------------------
     */
    const roadLengths = game.players.map((player) => ({
        playerId: player.id,
        length: calculateLongestRoad(
            game,
            player.id
        ),
    }));
    const updatedPlayers = game.players.map(
        (player) => {
            const roadLength =
                roadLengths.find(
                    (entry) =>
                        entry.playerId === player.id
                )?.length ?? 0;
            return {
                ...player,
                longestRoad: roadLength,
            };
        }
    );
    const updatedGame: GameState = {
        ...game,
        players: updatedPlayers,
    };
    /*
     * ------------------------------------------------------------
     * 2. Find the highest qualifying road length.
     * ------------------------------------------------------------
     *
     * Five roads are required before Longest Road can be claimed.
     */
    const highestLength = Math.max(
        0,
        ...roadLengths.map(
            (entry) => entry.length
        )
    );
    const qualifyingPlayers =
        roadLengths.filter(
            (entry) => entry.length >= 5
        );
    /*
     * No player qualifies.
     */
    if (qualifyingPlayers.length === 0) {
        /*
         * If somebody currently owns the award, remove it.
         */
        if (updatedGame.longestRoadPlayerId) {
            return removeLongestRoadHolder(updatedGame);
        }
        return updatedGame;
    }
    /*
     * ------------------------------------------------------------
     * 3. Find everyone tied for the highest qualifying length.
     * ------------------------------------------------------------
     */
    const leaders = qualifyingPlayers.filter(
        (entry) =>
            entry.length === highestLength
    );
    /*
     * ------------------------------------------------------------
     * 4. Handle an existing holder.
     * ------------------------------------------------------------
     */
    const currentHolderId =
        updatedGame.longestRoadPlayerId;
    if (currentHolderId) {
        const currentHolderLength =
            roadLengths.find(
                (entry) =>
                    entry.playerId ===
                    currentHolderId
            )?.length ?? 0;
        /*
         * If the current holder is still tied for the highest
         * qualifying length, they keep Longest Road.
         *
         * This is the important tie rule.
         */
        if (
            currentHolderLength >= 5 &&
            leaders.some(
                (leader) =>
                    leader.playerId ===
                    currentHolderId
            )
        ) {
            return updatedGame;
        }
        /*
         * The current holder has fallen behind.
         *
         * If there is a unique leader who is strictly ahead,
         * transfer the award.
         */
        if (leaders.length === 1) {
            return transferLongestRoad(
                updatedGame,
                currentHolderId,
                leaders[0].playerId
            );
        }
        /*
         * There are multiple players tied ahead of the old holder.
         *
         * Nobody can take the award during the tie.
         */
        return removeLongestRoadHolder(updatedGame);
    }
    /*
     * ------------------------------------------------------------
     * 5. No current holder.
     * ------------------------------------------------------------
     *
     * A unique qualifying leader gets the award.
     *
     * If two or more players are tied, nobody receives it.
     */
    if (leaders.length === 1) {
        return transferLongestRoad(
            updatedGame,
            undefined,
            leaders[0].playerId
        );
    }
    return updatedGame;
}
/**
 * Transfer Longest Road from one player to another.
 */
function transferLongestRoad(
    game: GameState,
    previousHolderId: string | undefined,
    newHolderId: string
): GameState {
    /*
     * Don't do anything if ownership hasn't changed.
     */
    if (
        previousHolderId === newHolderId
    ) {
        return game;
    }
    const newPlayers = game.players.map(
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
                player.id === newHolderId
            ) {
                return {
                    ...player,
                    vp: player.vp + 2,
                };
            }
            return player;
        }
    );
    const newHolder =
        newPlayers.find(
            (player) =>
                player.id === newHolderId
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
        players: newPlayers,
        longestRoadPlayerId:
            newHolderId,
        eventLog: [
            ...game.eventLog,
            ...(previousHolder
                ? [
                    createEvent(
                        "LONGEST_ROAD_CLAIMED",
                        `${previousHolder.name} lost Longest Road. (-2VP)`
                    ),
                    createEvent(
                        "LONGEST_ROAD_CLAIMED",
                        `${newHolder.name} took Longest Road from ${previousHolder.name}. (+2VP)`
                    ),
                ]
                : [
                    createEvent(
                        "LONGEST_ROAD_CLAIMED",
                        `${newHolder.name} claimed Longest Road. (+2VP)`
                    ),
                ]),
        ],
    };
}
/**
 * Remove Longest Road ownership.
 */
function removeLongestRoadHolder(
    game: GameState
): GameState {
    const previousHolderId =
        game.longestRoadPlayerId;
    if (!previousHolderId) {
        return game;
    }
    const previousHolder =
        game.players.find(
            (player) =>
                player.id === previousHolderId
        );
    const updatedPlayers =
        game.players.map(
            (player) => {
                if (
                    player.id !==
                    previousHolderId
                ) {
                    return player;
                }
                return {
                    ...player,
                    vp: Math.max(
                        0,
                        player.vp - 2
                    ),
                };
            }
        );
    const event = createEvent(
        "LONGEST_ROAD_CLAIMED",
        previousHolder
            ? `${previousHolder.name} lost Longest Road. (-2VP)`
            : "Longest Road ownership was removed."
    );
    return {
        ...game,
        players: updatedPlayers,
        longestRoadPlayerId: undefined,
        eventLog: [
            ...game.eventLog,
            event,
        ],
    };
}