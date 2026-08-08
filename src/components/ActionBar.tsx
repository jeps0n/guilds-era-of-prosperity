interface ActionBarProps {
    onEndTurn: () => void;
    phase:
    | "guild_selection"
    | "initial_placement"
    | "playing"
    | "game_over";
    placementAction?: "settlement" | "road";
}
interface ActionButtonProps {
    label: string;
    icon: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}
function ActionButton({
    label,
    icon,
    active = false,
    disabled = false,
    onClick,
}: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                flex: "1 1 0",
                minWidth: "92px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: active
                    ? "2px solid #60a5fa"
                    : "1px solid #374151",
                background: active
                    ? "#1d4ed8"
                    : disabled
                        ? "#1f2937"
                        : "#111827",
                color: disabled
                    ? "#6b7280"
                    : "white",
                cursor: disabled
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition:
                    "background 0.15s ease, border 0.15s ease",
                boxSizing: "border-box",
            }}
        >
            <span
                style={{
                    fontSize: "20px",
                    lineHeight: 1,
                }}
            >
                {icon}
            </span>
            <span
                style={{
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </span>
        </button>
    );
}
function ActionBar({
    onEndTurn,
    phase,
    placementAction,
}: ActionBarProps) {
    const isInitialPlacement =
        phase === "initial_placement";
    const isPlaying =
        phase === "playing";
    return (
        <div
            style={{
                width: "100%",
                marginTop: "0px",
                display: "flex",
                justifyContent: "center",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "800px",
                    maxWidth: "100%",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "0 0 14px 14px",
                    padding: "10px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "stretch",
                    justifyContent: "center",
                    boxShadow:
                        "0 8px 24px rgba(0,0,0,0.25)",
                    boxSizing: "border-box",
                }}
            >
                <ActionButton
                    icon="🤝"
                    label="Trade"
                    disabled={!isPlaying}
                />
                <ActionButton
                    icon="🃏"
                    label="Development Card"
                    disabled={!isPlaying}
                />
                <ActionButton
                    icon="🛣️"
                    label="Road"
                    active={
                        isInitialPlacement &&
                        placementAction === "road"
                    }
                    disabled={!isInitialPlacement}
                />
                <ActionButton
                    icon="🏠"
                    label="Settlement"
                    active={
                        isInitialPlacement &&
                        placementAction === "settlement"
                    }
                    disabled={!isInitialPlacement}
                />
                <ActionButton
                    icon="🏙️"
                    label="City"
                    disabled={!isPlaying}
                />
                <ActionButton
                    icon="⏳"
                    label="End Turn"
                    disabled={!isPlaying}
                    onClick={onEndTurn}
                />
            </div>
        </div>
    );
}
export default ActionBar;