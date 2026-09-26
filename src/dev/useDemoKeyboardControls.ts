import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GameState } from "../game/engine/GameState";
import { DemoControls } from "./DemoControls";
interface DemoKeyboardControlsOptions {
    game: GameState;
    setGame: Dispatch<SetStateAction<GameState>>;
    superUnlockRevealing: boolean;
    blockDueToBoardPending: () => boolean;
    onRestoreCheckpoint: () => void;
    onRollDice: () => void;
    onEndTurn: () => void;
}
export function useDemoKeyboardControls({
    game,
    setGame,
    superUnlockRevealing,
    blockDueToBoardPending,
    onRestoreCheckpoint,
    onRollDice,
    onEndTurn,
}: DemoKeyboardControlsOptions): void {
    const demoModifier = useRef<"+" | "=" | "-" | null>(null);
    useEffect(() => {
        const currentPlayer = game.players.find(
            (player) => player.id === game.currentPlayerId
        );
        console.log("=================== / GAME / ===================");
        console.log(game);
        console.log(
            "~~~~~~~ " + currentPlayer?.id + " : " + currentPlayer?.name +
            " ~~~~~ [Turn: " + game.turnNumber + "] ~~~~~~~"
        );
        console.log(currentPlayer);
        console.log("------------------------------------------------");
        function handleKeyDown(event: KeyboardEvent) {
            const key = event.key.toLowerCase();
            if (key === "t") {
                onRestoreCheckpoint();
                return;
            }
            if (key === "r" || key === "e") {
                if (blockDueToBoardPending()) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (key === "r") {
                    onRollDice();
                    return;
                }
                onEndTurn();
                return;
            }
            if (key === "+" || key === "=" || key === "-") {
                demoModifier.current = key === "+" || key === "=" ? "+" : "-";
                return;
            }
            if (demoModifier.current && ["1", "2", "3", "4", "5"].includes(key)) {
                setGame((currentGame) =>
                    DemoControls.modifyResource(
                        currentGame,
                        currentGame.currentPlayerId,
                        key as "1" | "2" | "3" | "4" | "5",
                        demoModifier.current!
                    )
                );
                return;
            }
            if (demoModifier.current === "+" && key === "d") {
                setGame((currentGame) =>
                    DemoControls.addDevelopmentCard(currentGame, currentGame.currentPlayerId)
                );
                return;
            }
            if (demoModifier.current === "-" && key === "d") {
                setGame((currentGame) =>
                    DemoControls.removeLastDevelopmentCard(currentGame, currentGame.currentPlayerId)
                );
                return;
            }
            if (demoModifier.current && key === "s") {
                const secondaryRollMenuIsOpen =
                    !superUnlockRevealing &&
                    (game.secondaryRollPending || game.secondaryRoll !== undefined);
                setGame((currentGame) =>
                    DemoControls.modifySecondaryRolls(
                        currentGame,
                        currentGame.currentPlayerId,
                        demoModifier.current!,
                        secondaryRollMenuIsOpen
                    )
                );
                return;
            }
            if (demoModifier.current && key === "v") {
                setGame((currentGame) =>
                    DemoControls.modifyVictoryPoints(
                        currentGame,
                        currentGame.currentPlayerId,
                        demoModifier.current!
                    )
                );
            }
        }
        function handleKeyUp(event: KeyboardEvent) {
            const key = event.key.toLowerCase();
            if (key === "+" || key === "=" || key === "-") {
                demoModifier.current = null;
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [
        game,
        setGame,
        superUnlockRevealing,
        blockDueToBoardPending,
        onRestoreCheckpoint,
        onRollDice,
        onEndTurn,
    ]);
}
