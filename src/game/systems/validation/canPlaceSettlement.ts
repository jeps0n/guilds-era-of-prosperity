import type { GameState } from "../../engine/GameState";
export function canPlaceSettlement(
    game: GameState,
    nodeId: string
): boolean {
    const currentPlayer = game.players.find(
        (player) =>
            player.id === game.currentPlayerId
    );
    if (!currentPlayer) {
        return false;
    }
    /*
     * Rule 1:
     * Node cannot already contain a settlement or city.
     */
    const occupied = game.players.some(
        (player) =>
            player.settlements.some(
                (settlement) =>
                    settlement.nodeId === nodeId
            ) ||
            player.cities.some(
                (cityId) =>
                    cityId === nodeId
            )
    );
    if (occupied) {
        return false;
    }
    /*
     * Rule 2:
     * Settlement distance rule.
     *
     * A settlement cannot be placed directly
     * adjacent to another settlement or city.
     */
    const adjacentNodes =
        getAdjacentNodes(game, nodeId);
    const blocked = game.players.some(
        (player) =>
            player.settlements.some(
                (settlement) =>
                    adjacentNodes.includes(
                        settlement.nodeId
                    )
            ) ||
            player.cities.some(
                (cityId) =>
                    adjacentNodes.includes(cityId)
            )
    );
    if (blocked) {
        return false;
    }
    /*
     * Initial placement:
     * Settlements do not need to connect
     * to an existing road.
     */
    if (game.phase === "initial_placement") {
        return true;
    }
    /*
     * Normal play:
     * Settlement must connect to at least
     * one road owned by the current player.
     */
    if (game.phase === "playing") {
        const connectedToOwnRoad =
            game.board.edges.some(
                (edge) =>
                    (
                        edge.nodeA === nodeId ||
                        edge.nodeB === nodeId
                    ) &&
                    currentPlayer.roads.includes(
                        edge.id
                    )
            );
        return connectedToOwnRoad;
    }
    return false;
}
function getAdjacentNodes(
    game: GameState,
    nodeId: string
): string[] {
    return game.board.edges.flatMap(
        (edge) => {
            if (edge.nodeA === nodeId) {
                return [edge.nodeB];
            }
            if (edge.nodeB === nodeId) {
                return [edge.nodeA];
            }
            return [];
        }
    );
}