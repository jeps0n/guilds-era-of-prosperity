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
    function renderEventMessage(
        message: string
    ) {
        const parts = message.split(
            /(Player A|Player B|\[(?:brick|lumber|wheat|sheep|ore)\] \d+)/g
        );
        return parts.map((part, index) => {
            if (
                part === "Player A" ||
                part === "Player B"
            ) {
                const color =
                    part === "Player A"
                        ? "#f97316"
                        : "#9333ea";
                return (
                    <strong
                        key={index}
                        style={{
                            color,
                        }}
                    >
                        {part}
                    </strong>
                );
            }
            const resourceMatch = part.match(
                /^\[(brick|lumber|wheat|sheep|ore)\] (\d+)$/
            );
            if (resourceMatch) {
                const resource =
                    resourceMatch[1];
                const amount =
                    resourceMatch[2];
                const resourceColors: Record<
                    string,
                    string
                > = {
                    brick: "#b45309",
                    lumber: "#166534",
                    wheat: "#eab308",
                    sheep: "#65a30d",
                    ore: "#6b7280",
                };
                return (
                    <span
                        key={index}
                        style={{
                            display:
                                "inline-flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            width: "22px",
                            height: "22px",
                            margin: "0 3px",
                            borderRadius: "6px",
                            backgroundColor:
                                resourceColors[
                                resource
                                ],
                            color:
                                "#000000",
                            verticalAlign:
                                "middle",
                            fontSize: "12px",
                            fontWeight: "bold",
                        }}
                    >
                        {amount}
                    </span>
                );
            }
            return (
                <span key={index}>
                    {part}
                </span>
            );
        });
    }
    return (
        <div
            style={{
                marginTop: "8px",
                marginBottom: "8px",
            }}
        >
            <Panel>
                <strong>Game Log</strong>
                <hr
                    style={{
                        margin: "8px 0",
                        borderColor:
                            "#374151",
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
                    {game.eventLog.length ===
                        0 ? (
                        <div
                            style={{
                                color:
                                    "#6b7280",
                            }}
                        >
                            No events yet.
                        </div>
                    ) : (
                        game.eventLog.map(
                            (event) => (
                                <div
                                    key={
                                        event.id
                                    }
                                    style={{
                                        padding:
                                            "6px 0",
                                        borderBottom:
                                            "1px solid #1f2937",
                                        color:
                                            "#d1d5db",
                                    }}
                                >
                                    {renderEventMessage(
                                        event.message
                                    )}
                                </div>
                            )
                        )
                    )}
                </div>
            </Panel>
        </div>
    );
}
export default GameLog;