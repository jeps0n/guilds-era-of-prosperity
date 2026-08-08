import type { GameState } from "../game/engine/GameState";
let checkpoints: GameState[] = [];
function statesMatch(
    a: GameState,
    b: GameState
): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}
export function savePhaseCheckpoint(
    game: GameState
): void {
    const latest =
        checkpoints[
        checkpoints.length - 1
        ];
    if (
        latest &&
        statesMatch(latest, game)
    ) {
        return;
    }
    checkpoints.push(
        structuredClone(game)
    );
}
export function canRestorePhaseCheckpoint(
    currentGame: GameState
): boolean {
    if (
        checkpoints.length === 0
    ) {
        return false;
    }
    const latest =
        checkpoints[
        checkpoints.length - 1
        ];
    if (
        !statesMatch(
            currentGame,
            latest
        )
    ) {
        return true;
    }
    return checkpoints.length > 1;
}
export function restorePhaseCheckpoint(
    currentGame: GameState
): GameState | null {
    if (
        !canRestorePhaseCheckpoint(
            currentGame
        )
    ) {
        return null;
    }
    const latest =
        checkpoints[
        checkpoints.length - 1
        ];
    if (
        !statesMatch(
            currentGame,
            latest
        )
    ) {
        return structuredClone(
            latest
        );
    }
    checkpoints.pop();
    const previous =
        checkpoints[
        checkpoints.length - 1
        ];
    if (!previous) {
        return null;
    }
    return structuredClone(
        previous
    );
}
export function clearPhaseCheckpoints(): void {
    checkpoints = [];
}