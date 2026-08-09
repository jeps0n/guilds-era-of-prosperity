import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
export function getTradeRatio(
    game: GameState,
    playerId: string,
    resource: keyof Resources
): number {
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return 4;
    }
    const occupiedNodeIds = new Set([
        ...player.settlements.map(
            (settlement) => settlement.nodeId
        ),
        ...player.cities,
    ]);
    const ports = game.board.ports.filter(
        (port) =>
            port.nodeIds.some((nodeId) =>
                occupiedNodeIds.has(nodeId)
            )
    );
    const hasSpecificPort = ports.some(
        (port) => port.type === resource
    );
    if (hasSpecificPort) {
        return 2;
    }
    const hasGenericPort = ports.some(
        (port) => port.type === "generic"
    );
    if (hasGenericPort) {
        return 3;
    }
    return 4;
}