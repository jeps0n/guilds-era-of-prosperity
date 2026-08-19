import Panel from "./ui/Panel";
import { GUILDS } from "../game/data/guilds";
import type { GameState } from "../game/engine/GameState";
import type { GuildType } from "../game/engine/types";
interface GuildInformationPanelProps {
    player: GameState["players"][number];
    prosperityRollSequenceActive: boolean;
    onUseSuper: () => void;
}
function GuildInformationPanel({
    player,
    prosperityRollSequenceActive,
    onUseSuper,
}: GuildInformationPanelProps) {
    const secondaryRolls = player.secondaryRolls;
    const showSuperButton =
        player.superUnlocked && !prosperityRollSequenceActive;
    return (
        <div style={{ marginTop: "12px" }}>
            <Panel>
                {/* SUPER PROGRESS / SUPER BUTTON */}
                {!showSuperButton ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6].map((number) => {
                            const claimed =
                                secondaryRolls.includes(number);
                            const diceFaces = [
                                "⚀",
                                "⚁",
                                "⚂",
                                "⚃",
                                "⚄",
                                "⚅",
                            ];
                            return (
                                <div
                                    key={number}
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "9px",
                                        fontSize: "40px",
                                        lineHeight: 1,
                                        color: claimed
                                            ? "#f3f4f6"
                                            : "#4b5563",
                                        backgroundColor: claimed
                                            ? "#374151"
                                            : "#1f2937",
                                        border: claimed
                                            ? "1px solid #9ca3af"
                                            : "1px solid #111827",
                                        boxShadow: claimed
                                            ? `
                                                0 3px 6px rgba(0, 0, 0, 0.45),
                                                inset 0 1px 0 rgba(255, 255, 255, 0.15)
                                            `
                                            : `
                                                inset 0 3px 5px rgba(0, 0, 0, 0.55),
                                                0 1px 1px rgba(255, 255, 255, 0.03)
                                            `,
                                        opacity: claimed ? 1 : 0.45,
                                        transform: claimed
                                            ? "translateY(-2px)"
                                            : "translateY(2px)",
                                    }}
                                >
                                    {diceFaces[number - 1]}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: "10px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onUseSuper}
                            style={{
                                width: "352px",
                                height: "52px",
                                padding: "0",
                                borderRadius: "10px",
                                border: "2px solid #D4AF55",
                                background:
                                    "linear-gradient(180deg, #D4AF55, #9F7B2F)",
                                color: "#FFF8DF",
                                fontSize: "20px",
                                fontWeight: "bold",
                                letterSpacing: "3px",
                                boxShadow:
                                    "0 0 10px rgba(212, 175, 85, 0.35)",
                                textShadow:
                                    "0 1px 2px rgba(0,0,0,0.5)",
                                cursor: "pointer",
                            }}
                        >
                            USE SUPER
                        </button>
                    </div>
                )}
                {/* GUILD INFORMATION */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                    }}
                >
                    <GuildColumn
                        guildType="builder"
                        guildName="BUILDER"
                        playerGuild={player.guild}
                    />
                    <GuildColumn
                        guildType="explorer"
                        guildName="EXPLORER"
                        playerGuild={player.guild}
                    />
                    <GuildColumn
                        guildType="merchant"
                        guildName="MERCHANT"
                        playerGuild={player.guild}
                    />
                </div>
            </Panel>
        </div>
    );
}
interface GuildColumnProps {
    guildType: GuildType;
    guildName: string;
    playerGuild?: GuildType;
}
function GuildColumn({
    guildType,
    guildName,
    playerGuild,
}: GuildColumnProps) {
    const guild = GUILDS.find(
        (guild) => guild.type === guildType
    );
    const superName = guild?.superName;
    const superDescription = guild?.superDescription;
    const passiveName = guild?.passiveName;
    const passiveDescrition = guild?.passiveDescription;

    const isActive = guildType === playerGuild;
    return (
        <div
            style={{
                position: "relative",
                padding: "9px 9px",
                boxSizing: "border-box",
                opacity: isActive ? 1 : 0.45,
                transform: isActive
                    ? "translateY(-2px)"
                    : "translateY(0)",
                background: isActive
                    ? "#292f38"
                    : "transparent",
                border: isActive
                    ? "1px solid rgba(212, 175, 85, 0.36)"
                    : "1px solid transparent",
                borderRadius: isActive
                    ? "8px"
                    : "0",
                boxShadow: isActive
                    ? `
                        0 3px 6px rgba(0, 0, 0, 0.34),
                        0 0 5px ${guild?.color ?? "#D4AF55"}18,
                        inset 0 1px 0 rgba(255, 255, 255, 0.08),
                        inset 0 -2px 4px rgba(0, 0, 0, 0.20)
                    `
                    : "none",
                transition: "transform 0.15s ease",
                zIndex: isActive ? 2 : 1,
            }}
        >
           <div style={{
                textAlign: "center",
            }}>
                <strong
                    style={{
                        color: guild?.color,
                        textAlign: "center",
                    }}
                >
                    {guildName}
                </strong>
            </div>
            <div
                style={{
                    margin: "1px 0px",
                }}
            >
                <strong>{superName}</strong>
                <span> (Super)</span>
            </div>
            <div
                style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                }}
            >
                {superDescription}
            </div>
            <hr style={{ margin: "3px" }} />
            <div
                style={{
                    margin: "1px 0px",
                    fontSize: "12px",
                }}
            >
                <strong>{passiveName}</strong>
                <span> (Passive)</span>
            </div>
            <div
                style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                }}
            >
                {passiveDescrition}
            </div>

        </div>
    );
}
export default GuildInformationPanel;