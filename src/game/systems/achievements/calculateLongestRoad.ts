import type { GameState } from "../../engine/GameState";
/**
 * Calculate the longest continuous road owned by a player.
 *
 * Rules handled here:
 * - Only the player's roads count.
 * - A physical road can only be used once in a single path.
 * - The path may start from any road endpoint.
 * - The path may branch, so we search every possible route.
 * - An opponent's settlement/city blocks the road from continuing
 *   through that intersection.
 * - The player's own settlement/city does NOT block their road.
 * - Loops are allowed.
 *
 * This function only calculates the length.
 * It does NOT award Longest Road.
 */
export function calculateLongestRoad(
    game: GameState,
    playerId: string
): number {
    /*
     * ------------------------------------------------------------
     * 1. Find the player.
     * ------------------------------------------------------------
     *
     * If the player doesn't exist, they obviously have no road.
     */
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return 0;
    }
    /*
     * ------------------------------------------------------------
     * 2. Create a Set containing this player's roads.
     * ------------------------------------------------------------
     *
     * A Set gives us fast lookups when building the road graph.
     */
    const playerRoads = new Set(player.roads);
    if (playerRoads.size === 0) {
        return 0;
    }
    /*
     * ------------------------------------------------------------
     * 3. Create an edge lookup table.
     * ------------------------------------------------------------
     *
     * Instead of repeatedly doing:
     *
     *     game.board.edges.find(...)
     *
     * during recursive searches, we create the lookup once.
     *
     * roadId -> edge
     */
    const edgesById = new Map(
        game.board.edges.map((edge) => [
            edge.id,
            edge,
        ])
    );
    /*
     * ------------------------------------------------------------
     * 4. Build the player's road graph.
     * ------------------------------------------------------------
     *
     * roadsByNode answers:
     *
     *     "Which of this player's roads touch this node?"
     *
     * Example:
     *
     *     nodeA -> [road1, road4]
     *     nodeB -> [road1, road2]
     *     nodeC -> [road2, road3]
     *
     * This gives the recursive search a fast way to find
     * the next roads it can travel.
     */
    const roadsByNode = new Map<string, string[]>();
    for (const roadId of playerRoads) {
        const edge = edgesById.get(roadId);
        if (!edge) {
            continue;
        }
        if (!roadsByNode.has(edge.nodeA)) {
            roadsByNode.set(edge.nodeA, []);
        }
        if (!roadsByNode.has(edge.nodeB)) {
            roadsByNode.set(edge.nodeB, []);
        }
        roadsByNode
            .get(edge.nodeA)!
            .push(edge.id);
        roadsByNode
            .get(edge.nodeB)!
            .push(edge.id);
    }
    /*
     * ------------------------------------------------------------
     * 5. Determine which nodes are blocked by opponents.
     * ------------------------------------------------------------
     *
     * An opponent's settlement/city breaks a road.
     *
     * For example:
     *
     *     A ---- B ---- C
     *          [OPP]
     *
     * The road can reach B, but the path cannot continue
     * from B through the opponent's structure.
     *
     * IMPORTANT:
     *
     * The player's own settlement/city does NOT block their
     * road, so we only collect structures belonging to opponents.
     */
    const opponentStructureNodes = new Set<string>();
    for (const candidate of game.players) {
        if (candidate.id === playerId) {
            continue;
        }
        for (const settlement of candidate.settlements) {
            opponentStructureNodes.add(
                settlement.nodeId
            );
        }
        for (const cityNodeId of candidate.cities) {
            opponentStructureNodes.add(
                cityNodeId
            );
        }
    }
    /*
     * ------------------------------------------------------------
     * 6. Recursive longest-path search.
     * ------------------------------------------------------------
     *
     * This is the core of the algorithm.
     *
     * We start at a node and ask:
     *
     *     "What is the longest road I can continue through
     *      from this node?"
     *
     * `usedRoads` tracks the physical roads already used in
     * THIS particular path.
     *
     * We cannot simply use a global visited Set because the
     * same road may legitimately be part of a different
     * possible path.
     */
    function searchFromNode(
        nodeId: string,
        usedRoads: Set<string>
    ): number {
        const connectedRoads =
            roadsByNode.get(nodeId) ?? [];
        let longest = 0;
        /*
         * Try every road connected to the current node.
         *
         * Each one represents a different possible continuation
         * of the road.
         */
        for (const roadId of connectedRoads) {
            /*
             * A physical road can only be counted once in a
             * single continuous path.
             */
            if (usedRoads.has(roadId)) {
                continue;
            }
            const edge = edgesById.get(roadId);
            if (!edge) {
                continue;
            }
            /*
             * Determine which node is on the other side of
             * this road.
             */
            const nextNode =
                edge.nodeA === nodeId
                    ? edge.nodeB
                    : edge.nodeA;
            /*
             * Mark this physical road as used.
             *
             * This road now contributes 1 to the current path.
             */
            usedRoads.add(roadId);
            let length = 1;
            /*
             * If the destination node contains an opponent's
             * structure, the road we just traveled still counts,
             * but we cannot continue through that node.
             *
             * Example:
             *
             *     A ---- B ---- C
             *          [OPP]
             *
             * Traveling A -> B gives us 1 road.
             * We cannot continue B -> C.
             */
            if (!opponentStructureNodes.has(nextNode)) {
                length += searchFromNode(
                    nextNode,
                    usedRoads
                );
            }
            /*
             * Backtrack.
             *
             * We remove the road so that another possible path
             * can use it.
             *
             * This is what allows us to correctly explore branches
             * and loops.
             */
            usedRoads.delete(roadId);
            /*
             * Keep the longest route found from this node.
             */
            longest = Math.max(
                longest,
                length
            );
        }
        return longest;
    }
    /*
     * ------------------------------------------------------------
     * 7. Try every node as a possible starting point.
     * ------------------------------------------------------------
     *
     * We cannot assume the longest road starts at a particular
     * endpoint.
     *
     * Example:
     *
     *          A
     *          |
     *     B ---C--- D --- E
     *          |
     *          F
     *
     * The longest path might begin from A, B, D, E, or F.
     *
     * Therefore, every node touched by the player's roads gets
     * tested as a starting point.
     */
    let longestRoad = 0;
    for (const nodeId of roadsByNode.keys()) {
        const length = searchFromNode(
            nodeId,
            new Set<string>()
        );
        longestRoad = Math.max(
            longestRoad,
            length
        );
    }
    /*
     * ------------------------------------------------------------
     * 8. Return the player's longest continuous road.
     * ------------------------------------------------------------
     *
     * This is only the calculation.
     *
     * The Longest Road achievement itself should be handled
     * somewhere else, such as:
     *
     *     updateLongestRoad.ts
     */
    return longestRoad;
}