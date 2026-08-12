import type { ActionAvailability } from "../game/systems/actions/getActionAvailability";
const ACTIVE_BUTTON_BACKGROUND = "#1d4ed8";
const DISABLED_BUTTON_BACKGROUND = "#1f2937";
const DEFAULT_BUTTON_BACKGROUND = "#111827";
const ACTIVE_BUTTON_BORDER = "#60a5fa";
const DEFAULT_BUTTON_BORDER = "#374151";
interface ActionBarProps {
    onRollDice?: () => void;
    onEndTurn?: () => void;
    onTrade?: () => void;
    onBuyDevelopmentCard?: () => void;
    onPlayDevelopmentCard?: () => void;
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
    roadBuildingPending?: boolean;
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
                minWidth: "100px",
                maxWidth: "100px",
                minHeight: "64px",
                maxHeight: "64px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: active
                    ? `2px solid ${ACTIVE_BUTTON_BORDER}`
                    : `1px solid ${DEFAULT_BUTTON_BORDER}`,
                background: active
                    ? ACTIVE_BUTTON_BACKGROUND
                    : disabled
                        ? DISABLED_BUTTON_BACKGROUND
                        : DEFAULT_BUTTON_BACKGROUND,
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
    onTrade,
    onBuyDevelopmentCard,
    onPlayDevelopmentCard,
    phase,
    placementAction,
    lastDiceRoll,
    availability,
    diceOnly = false,
    hideDice = false,
    playerColor = "DEFAULT_BUTTON_BACKGROUND",
    roadBuildingPending = false,
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
    const canBuyDevelopmentCard =
        availability?.canBuyDevelopmentCard ??
        false;
    const canPlayDevelopmentCard =
        availability?.canPlayDevelopmentCard ??
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
                active={canRoll && !roadBuildingPending}
                disabled={!canRoll || roadBuildingPending}
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
                    background:
                        actionBarBackground,
                    border: `1px solid ${DEFAULT_BUTTON_BORDER}`,
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
                    icon="💰"
                    label="Trade"
                    active={canTrade}
                    disabled={!canTrade}
                    onClick={onTrade}
                />
                <ActionButton
                    icon="🎴"
                    label="Buy Dev Card"
                    active={canBuyDevelopmentCard}
                    disabled={!canBuyDevelopmentCard}
                    onClick={onBuyDevelopmentCard}
                />
                <ActionButton
                    icon="🃏"
                    label="Play Dev Card"
                    active={canPlayDevelopmentCard}
                    disabled={!canPlayDevelopmentCard}
                    onClick={onPlayDevelopmentCard}
                />
                <ActionButton
                    icon="🛣️"
                    label="Road"
                    active={
                        isInitialPlacement
                            ? placementAction === "road"
                            : canRoad
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
                        isInitialPlacement
                            ? placementAction === "settlement"
                            : canSettlement
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
                    active={canCity}
                    disabled={!canCity}
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