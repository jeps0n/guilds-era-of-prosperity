import type { ActionAvailability } from "../game/systems/actions/getActionAvailability";
interface ActionBarProps {
    onRollDice?: () => void;
    onEndTurn?: () => void;
    phase:
    | "guild_selection"
    | "initial_placement"
    | "playing"
    | "game_over";
    placementAction?:
    | "settlement"
    | "road";
    lastDiceRoll?: number;
    availability?: ActionAvailability;
    diceOnly?: boolean;
    hideDice?: boolean;
    playerColor?: string;
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
                gap: "4px",
                transition:
                    "background 0.15s ease, border 0.15s ease",
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
function hexToRgba(
    hex: string,
    alpha: number
): string {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) {
        return `rgba(17, 24, 39, ${alpha})`;
    }
    const red = parseInt(
        normalized.slice(0, 2),
        16
    );
    const green = parseInt(
        normalized.slice(2, 4),
        16
    );
    const blue = parseInt(
        normalized.slice(4, 6),
        16
    );
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
function ActionBar({
    onRollDice,
    onEndTurn,
    phase,
    placementAction,
    lastDiceRoll,
    availability,
    diceOnly = false,
    hideDice = false,
    playerColor = "#111827",
}: ActionBarProps) {
    const isInitialPlacement =
        phase === "initial_placement";
    const isPlaying =
        phase === "playing";
    const canRoll =
        availability?.canRollDice ??
        (isPlaying &&
            lastDiceRoll === undefined);
    const canEndTurn =
        availability?.canEndTurn ??
        (isPlaying &&
            lastDiceRoll !== undefined);
    const canTrade =
        availability?.canTrade ??
        isPlaying;
    const canRoad =
        availability?.canRoad ??
        false;
    const canSettlement =
        availability?.canSettlement ??
        false;
    const canCity =
        availability?.canCity ??
        false;
    const canBuyDevelopment =
        availability?.canBuyDevelopment ??
        false;
    const actionBarBackground =
        hexToRgba(playerColor, 0.50);
    if (diceOnly) {
        return (
            <ActionButton
                icon="🎲"
                label={
                    lastDiceRoll !== undefined
                        ? `Rolled ${lastDiceRoll}`
                        : "Roll Dice"
                }
                active={canRoll}
                disabled={!canRoll}
                onClick={onRollDice}
            />
        );
    }
    return (
        <div
            style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                overflowX: "auto",
            }}
        >
            <div
                style={{
                    background: actionBarBackground,
                    border: "1px solid #374151",
                    borderRadius: "14px",
                    padding: "10px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                        "0 8px 24px rgba(0,0,0,0.25)",
                    flexWrap: "nowrap",
                }}
            >
                {!hideDice && (
                    <ActionButton
                        icon="🎲"
                        label={
                            lastDiceRoll !== undefined
                                ? `Rolled ${lastDiceRoll}`
                                : "Roll Dice"
                        }
                        active={canRoll}
                        disabled={!canRoll}
                        onClick={onRollDice}
                    />
                )}
                <ActionButton
                    icon="🤝"
                    label="Trade"
                    disabled={!canTrade}
                />
                <ActionButton
                    icon="🛣️"
                    label="Road"
                    active={
                        isInitialPlacement &&
                        placementAction === "road"
                    }
                    disabled={
                        isInitialPlacement
                            ? placementAction !== "road"
                            : !canRoad
                    }
                />
                <ActionButton
                    icon="🏠"
                    label="Settlement"
                    active={
                        isInitialPlacement &&
                        placementAction === "settlement"
                    }
                    disabled={
                        isInitialPlacement
                            ? placementAction !== "settlement"
                            : !canSettlement
                    }
                />
                <ActionButton
                    icon="🏙️"
                    label="City"
                    disabled={!canCity}
                />
                <ActionButton
                    icon="🎴"
                    label="Buy Development"
                    disabled={!canBuyDevelopment}
                />
                <ActionButton
                    icon="⏭️"
                    label="End Turn"
                    active={canEndTurn}
                    disabled={!canEndTurn}
                    onClick={onEndTurn}
                />
            </div>
        </div>
    );
}
export default ActionBar;