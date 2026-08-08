import {
    useEffect,
    useRef,
} from "react";
import type { GameState } from "../game/engine/GameState";
import Panel from "./ui/Panel";
interface GameLogProps {
    game: GameState;
}
function GameLog({
    game,
}: GameLogProps) {
    const logRef =
        useRef<HTMLDivElement>(null);
    useEffect(() => {
        const log = logRef.current;
        if (!log) {
            return;
        }
        log.scrollTop =
            log.scrollHeight;
    }, [game.eventLog.length]);
    return (
        <div
            style={{
                marginTop: "12px",
                marginBottom: "12px",
            }}
        >
            <Panel>
                <strong>Game Log</strong>
                <hr
                    style={{
                        margin: "8px 0",
                        borderColor: "#374151",
                    }}
                />
                <div
                    ref={logRef}
                    style={{
                        height: "180px",
                        overflowY: "auto",
                        fontSize: "14px",
                        textAlign: "left",
                        paddingRight: "4px",
                    }}
                >
                    {game.eventLog.length === 0 ? (
                        <div
                            style={{
                                color: "#6b7280",
                            }}
                        >
                            No events yet.
                        </div>
                    ) : (
                        game.eventLog.map((event) => (
                            <div
                                key={event.id}
                                style={{
                                    padding: "6px 0",
                                    borderBottom:
                                        "1px solid #1f2937",
                                    color: "#d1d5db",
                                }}
                            >
                                {event.message}
                            </div>
                        ))
                    )}
                </div>
            </Panel>
        </div>
    );
}
export default GameLog;