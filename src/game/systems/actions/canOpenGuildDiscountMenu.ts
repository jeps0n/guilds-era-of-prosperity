import type { GameState } from "../../engine/GameState";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
type GuildDiscountAction =
    | "settlement"
    | "city"
    | "road";
/**
 * UI guard for guild discount flows.
 *
 * This is NOT authoritative game validation.
 * The engine remains authoritative when the build action
 * is actually resolved.
 *
 * It is a surface level check to prevent the Builder/Explorer
 * secondary discount menu from opening when they click a
 * board location that is already known to be invalid.
 */
export function canOpenGuildDiscountMenu(
    game: GameState,
    action: GuildDiscountAction,
    targetId: string
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === game.currentPlayerId
    );
    if (!player) {
        return false;
    }
    if (
        game.phase === "playing" &&
        game.lastDiceRoll === undefined
    ) {
        return false;
    }
    if (action === "settlement") {
        return canPlaceSettlement(
            game,
            targetId
        );
    }
    if (action === "city") {
        return player.settlements.some(
            (settlement) =>
                settlement.nodeId === targetId
        );
    }
    if (action === "road") {
        return canPlaceRoadForGuildMenu(
            game,
            player.id,
            targetId
        );
    }
    return false;
}
function canPlaceRoadForGuildMenu(
    game: GameState,
    playerId: string,
    edgeId: string
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    const edge = game.board.edges.find(
        (candidate) =>
            candidate.id === edgeId
    );
    if (!edge) {
        return false;
    }
    const occupied = game.players.some(
        (candidate) =>
            candidate.roads.includes(edgeId)
    );
    if (occupied) {
        return false;
    }
    const playerStructureNodes = new Set([
        ...player.settlements.map(
            (settlement) =>
                settlement.nodeId
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
    const candidateNodes = [
        edge.nodeA,
        edge.nodeB,
    ];
    for (const nodeId of candidateNodes) {
        if (
            playerStructureNodes.has(nodeId)
        ) {
            return true;
        }
        if (
            opponentStructureNodes.has(nodeId)
        ) {
            continue;
        }
        const connectedToPlayerRoad =
            game.board.edges.some(
                (candidateEdge) => {
                    if (
                        candidateEdge.id ===
                        edge.id
                    ) {
                        return false;
                    }
                    if (
                        !player.roads.includes(
                            candidateEdge.id
                        )
                    ) {
                        return false;
                    }
                    return (
                        candidateEdge.nodeA ===
                            nodeId ||
                        candidateEdge.nodeB ===
                            nodeId
                    );
                }
            );
        if (connectedToPlayerRoad) {
            return true;
        }
    }
    return false;
}