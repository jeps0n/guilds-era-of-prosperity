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
    const resourceColors: Record<
        string,
        string
    > = {
        brick: "#b45309",
        lumber: "#166534",
        wheat: "#eab308",
        sheep: "#65a30d",
        ore: "#6b7280",
        desert: "#d2b48c",
    };
    function renderNumberToken(
        value: string,
        key: number
    ) {
        return (
            <span
                key={key}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                    height: "22px",
                    margin: "0 3px",
                    borderRadius: "10px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #c0c0c0",
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    verticalAlign: "middle",
                    boxSizing: "border-box",
                }}
            >
                {value}
            </span>
        );
    }
    function renderResourceBadge(
        resource: string,
        key: number,
        amount?: string
    ) {
        return (
            <span
                key={key}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                    height: "22px",
                    margin: "0 3px",
                    borderRadius: "6px",
                    backgroundColor:
                        resourceColors[resource],
                    color: "#000000",
                    fontSize: "12px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    verticalAlign: "middle",
                    boxSizing: "border-box",
                }}
            >
                {amount}
            </span>
        );
    }
    function renderEventMessage(
        message: string
    ) {
        const parts = message.split(
            /(Zeke|Julie|\(\d+\)\s\[(?:brick|lumber|wheat|sheep|ore)\]|\(\?\)\s\[desert\]|\[(?:brick|lumber|wheat|sheep|ore)\] \d+)/
        );
        return parts.map((part, index) => {
            if (
                part === "Zeke" ||
                part === "Julie"
            ) {
                const color =
                    part === "Zeke"
                        ? "#f97316"
                        : "#9333ea";
                return (
                    <strong
                        key={index}
                        style={{ color }}
                    >
                        {part}
                    </strong>
                );
            }
            if (part === "(?) [desert]") {
                return renderResourceBadge(
                    "desert",
                    index + 2000
                );
            }
            const robberMatch =
                part.match(
                    /^\((\d+)\)\s\[(brick|lumber|wheat|sheep|ore)\]$/
                );
            if (robberMatch) {
                const number =
                    robberMatch[1];
                const resource =
                    robberMatch[2];
                return (
                    <span
                        key={index}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            verticalAlign: "middle",
                        }}
                    >
                        {renderNumberToken(
                            number,
                            index
                        )}
                        {renderResourceBadge(
                            resource,
                            index + 1000
                        )}
                    </span>
                );
            }
            const resourceMatch =
                part.match(
                    /^\[(brick|lumber|wheat|sheep|ore)\] (\d+)$/
                );
            if (resourceMatch) {
                const resource =
                    resourceMatch[1];
                const amount =
                    resourceMatch[2];
                return renderResourceBadge(
                    resource,
                    index,
                    amount
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
                        game.eventLog.map(
                            (event) => (
                                <div
                                    key={event.id}
                                    style={{
                                        padding: "6px 0",
                                        borderBottom:
                                            "1px solid #1f2937",
                                        color: "#d1d5db",
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