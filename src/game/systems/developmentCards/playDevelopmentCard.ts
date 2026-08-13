import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
export function playDevelopmentCard(
    game: GameState,
    playerId: string,
    cardId: string
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (game.lastDiceRoll === undefined) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    // Dev Card Rule: only one development card may be played per turn.
    if (player.developmentCardPlayedThisTurn) {
        return game;
    }
    const card = player.developmentCards.find(
        (candidate) => candidate.id === cardId
    );
    if (!card) {
        return game;
    }
    // Dev Card Rule: a development card purchased this turn cannot be played this turn.
    if (
        player.developmentCardsPurchasedThisTurn.includes(
            card.id
        )
    ) {
        return game;
    }
    // A card can only be played once.
    if (
        player.playedDevelopmentCardIds.includes(
            card.id
        )
    ) {
        return game;
    }
    // Victory Point cards are revealed/scored by ownership.
    // They are not manually played.
    if (card.type === "victory_point") {
        return game;
    }
    if (card.type === "monopoly") {
        return {
            ...game,
            monopolyPending: true,
            monopolyCardId: cardId,
            monopolyResource: undefined,
        };
    }
    const isYearOfPlenty =
        card.type === "year_of_plenty";
    const isRoadBuilding =
        card.type === "road_building";
    const canStartRoadBuilding =
        isRoadBuilding &&
        hasLegalRoadBuildingPlacement(
            game,
            playerId
        );
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                // YOP is not considered played until both
                // resource selections have been completed.
                developmentCardPlayedThisTurn:
                    isYearOfPlenty
                        ? candidate.developmentCardPlayedThisTurn
                        : true,
                playedDevelopmentCardIds:
                    isYearOfPlenty
                        ? candidate.playedDevelopmentCardIds
                        : [
                            ...candidate.playedDevelopmentCardIds,
                            card.id,
                        ],
                knightsPlayed:
                    card.type === "knight"
                        ? candidate.knightsPlayed + 1
                        : candidate.knightsPlayed,
            };
        }
    );
    return {
        ...game,
        players: updatedPlayers,
        // Knight starts the robber board action.
        robberPending:
            card.type === "knight",
        // Road Building starts the road board action.
        roadBuildingPending:
            canStartRoadBuilding,
        yearOfPlentyPending:
            isYearOfPlenty,
        yearOfPlentyCardId:
            isYearOfPlenty
                ? card.id
                : undefined,
        yearOfPlentyFirstResource:
            undefined,
        eventLog: isYearOfPlenty
            ? game.eventLog
            : [
                ...game.eventLog,
                createEvent(
                    "DEVELOPMENT_CARD_PLAYED",
                    `${player.name} played a ${card.type.replaceAll("_", " ")} card.`
                ),
            ],
    };
    function hasLegalRoadBuildingPlacement(
        game: GameState,
        playerId: string
    ): boolean {
        const player = game.players.find(
            (candidate) => candidate.id === playerId
        );
        if (!player) {
            return false;
        }
        // No physical road pieces remaining.
        if (player.roads.length >= 15) {
            return false;
        }
        const playerStructureNodes = new Set([
            ...player.settlements.map(
                (settlement) => settlement.nodeId
            ),
            ...player.cities,
        ]);
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
        return game.board.edges.some((edge) => {
            // An occupied edge cannot receive a road.
            const occupied = game.players.some(
                (candidate) =>
                    candidate.roads.includes(edge.id)
            );
            if (occupied) {
                return false;
            }
            const candidateNodes = [
                edge.nodeA,
                edge.nodeB,
            ];
            for (const nodeId of candidateNodes) {
                // A player's own structure connects the road.
                if (
                    playerStructureNodes.has(nodeId)
                ) {
                    return true;
                }
                // An opponent's structure blocks the network
                // from continuing through this node.
                if (
                    opponentStructureNodes.has(nodeId)
                ) {
                    continue;
                }
                // Otherwise, see whether one of the player's
                // existing roads reaches this node.
                const connectedToPlayerRoad =
                    game.board.edges.some(
                        (existingEdge) => {
                            if (
                                existingEdge.id ===
                                edge.id
                            ) {
                                return false;
                            }
                            if (
                                !player.roads.includes(
                                    existingEdge.id
                                )
                            ) {
                                return false;
                            }
                            return (
                                existingEdge.nodeA ===
                                nodeId ||
                                existingEdge.nodeB ===
                                nodeId
                            );
                        }
                    );
                if (connectedToPlayerRoad) {
                    return true;
                }
            }
            return false;
        });
    }
}