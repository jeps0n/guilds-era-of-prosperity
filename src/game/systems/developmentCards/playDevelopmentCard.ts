import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { updateLargestArmy } from "../achievements/updateLargestArmy";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { hasPlayableKnight } from "./hasPlayableKnight";
/*
 * Play a development card for a player.
 *
 * This function checks the basic development-card rules,
 * updates the player's card state, and starts any action
 * required by the card.
 */
export function playDevelopmentCard(
    game: GameState,
    playerId: string,
    cardId: string
): GameState {
    // Development cards can only be played during the normal playing phase.
    if (game.phase !== "playing") {
        return game;
    }
    // Only the current player may play a development card.
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    // Find the player attempting to play the card.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    // Only one development card may normally be played per turn.
    if (player.developmentCardPlayedThisTurn) {
        return game;
    }
    // Find the requested card in the player's hand.
    const card = player.developmentCards.find(
        (candidate) => candidate.id === cardId
    );
    if (!card) {
        return game;
    }
    // Normally, development cards require the dice to have been rolled.
    // The exception is a playable Knight, which may be played before the roll.
    if (
        game.lastDiceRoll === undefined &&
        (
            card.type !== "knight" ||
            !hasPlayableKnight(game, playerId)
        )
    ) {
        return game;
    }
    // A development card bought this turn cannot be played immediately.
    if (
        player.developmentCardsPurchasedThisTurn.includes(
            card.id
        )
    ) {
        return game;
    }
    // A development card that has already been played cannot be played again.
    if (
        player.playedDevelopmentCardIds.includes(
            card.id
        )
    ) {
        return game;
    }
    // Victory Point cards are passive and are not manually played.
    if (card.type === "victory_point") {
        return game;
    }
    // Monopoly waits for the player to choose which resource to take.
    if (card.type === "monopoly") {
        return {
            ...game,
            monopolyPending: true,
            monopolyCardId: cardId,
            monopolyResource: undefined,
        };
    }
    // Identify cards that require additional actions after being played.
    const isYearOfPlenty =
        card.type === "year_of_plenty";
    const isRoadBuilding =
        card.type === "road_building";
    // Check whether Road Building has at least one legal placement.
    const canStartRoadBuilding =
        isRoadBuilding &&
        hasLegalRoadBuildingPlacement(game, playerId);
    // Update the player who played the development card.
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                // Year of Plenty remains unplayed until its
                // resource selections have been completed.
                developmentCardPlayedThisTurn:
                    isYearOfPlenty
                        ? candidate.developmentCardPlayedThisTurn
                        : true,
                // Record the card as played unless Year of Plenty
                // is still waiting for its resource selections.
                playedDevelopmentCardIds:
                    isYearOfPlenty
                        ? candidate.playedDevelopmentCardIds
                        : [
                            ...candidate.playedDevelopmentCardIds,
                            card.id,
                        ],
                // Playing a Knight increases the player's
                // number of played Knights.
                knightsPlayed:
                    card.type === "knight"
                        ? candidate.knightsPlayed + 1
                        : candidate.knightsPlayed,
            };
        }
    );
    /*
     * Build the updated game state with the actions
     * created by the development card.
     */
    const updatedGame: GameState = {
        ...game,
        players: updatedPlayers,
        // A Knight starts the robber action.
        robberPending:
            card.type === "knight",
        // Road Building starts the road placement action.
        roadBuildingPending:
            canStartRoadBuilding,
        // A new Road Building action starts with zero roads placed.
        roadBuildingRoadsPlaced:
            isRoadBuilding
                ? 0
                : game.roadBuildingRoadsPlaced,
        // Year of Plenty starts its resource-selection action.
        yearOfPlentyPending:
            isYearOfPlenty,
        // Store the Year of Plenty card being resolved.
        yearOfPlentyCardId:
            isYearOfPlenty
                ? card.id
                : undefined,
        // Clear any previous Year of Plenty selection.
        yearOfPlentyFirstResource:
            undefined,
        // Record the card play in the event log.
        // Year of Plenty waits until its selections are complete.
        eventLog: isYearOfPlenty
            ? game.eventLog
            : [
                ...game.eventLog,
                createEvent(
                    "DEVELOPMENT_CARD_PLAYED",
                    `${player.name} played a ${card.type
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())} card.`
                ),
            ],
    };
    // Playing a Knight changes the player's Largest Army count.
    if (card.type === "knight") {
        const largestArmyUpdatedGame =
            updateLargestArmy(updatedGame);
        // Re-check milestones after the Knight changes the game state.
        return evaluateMilestones(
            largestArmyUpdatedGame
        );
    }
    // Return the updated state for all other development cards.
    return updatedGame;
    /*
     * Check whether the player has at least one legal
     * location for a Road Building road.
     */
    function hasLegalRoadBuildingPlacement(
        game: GameState,
        playerId: string
    ): boolean {
        // Find the player attempting to use Road Building.
        const player = game.players.find(
            (candidate) => candidate.id === playerId
        );
        if (!player) {
            return false;
        }
        // The player must have a physical road piece remaining.
        if (player.roads.length >= 15) {
            return false;
        }
        // These nodes can directly connect a new road to the player's network.
        const playerStructureNodes = new Set([
            ...player.settlements.map(
                (settlement) => settlement.nodeId
            ),
            ...player.cities,
        ]);
        // Opponent structures block the player's road network at those nodes.
        const opponentStructureNodes = new Set(
            game.players
                .filter(
                    (candidate) =>
                        candidate.id !== playerId
                )
                .flatMap((candidate) => [
                    ...candidate.settlements.map(
                        (settlement) =>
                            settlement.nodeId
                    ),
                    ...candidate.cities,
                ])
        );
        // Check every board edge for a legal Road Building placement.
        return game.board.edges.some((edge) => {
            // An occupied edge cannot receive another road.
            const occupied = game.players.some(
                (candidate) =>
                    candidate.roads.includes(edge.id)
            );
            if (occupied) {
                return false;
            }
            // A road can connect through either endpoint.
            const candidateNodes = [
                edge.nodeA,
                edge.nodeB,
            ];
            for (const nodeId of candidateNodes) {
                // The player's own structure connects the new road.
                if (
                    playerStructureNodes.has(nodeId)
                ) {
                    return true;
                }
                // An opponent's structure blocks the connection.
                if (
                    opponentStructureNodes.has(nodeId)
                ) {
                    continue;
                }
                // Otherwise, check whether an existing player road
                // connects to this node.
                const connectedToPlayerRoad =
                    game.board.edges.some(
                        (existingEdge) => {
                            // Do not compare the candidate edge with itself.
                            if (
                                existingEdge.id ===
                                edge.id
                            ) {
                                return false;
                            }
                            // The existing road must belong to the player.
                            if (
                                !player.roads.includes(
                                    existingEdge.id
                                )
                            ) {
                                return false;
                            }
                            // Check whether the existing road touches this node.
                            return (
                                existingEdge.nodeA ===
                                nodeId ||
                                existingEdge.nodeB ===
                                nodeId
                            );
                        }
                    );
                // A connected player road makes this edge a legal placement.
                if (connectedToPlayerRoad) {
                    return true;
                }
            }
            // No legal connection was found for this edge.
            return false;
        });
    }
}