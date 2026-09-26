import type { CSSProperties } from "react";
import type { GamePhase } from "../game/engine/GameState";
import type { ActionAvailability } from "../game/systems/actions/getActionAvailability";
const ACTIVE_BUTTON_BACKGROUND = "linear-gradient(180deg, #c5a45c, #7b5d29)";
const DISABLED_BUTTON_BACKGROUND = "#171a18";
const DEFAULT_BUTTON_BACKGROUND = "linear-gradient(180deg, #292d28, #171a18)";
const ACTIVE_BUTTON_BORDER = "#efd68b";
const DEFAULT_BUTTON_BORDER = "rgba(205, 170, 92, 0.28)";
interface ActionBarProps {
    prosperityRollSequenceActive?: boolean;
    onRollDice?: () => void;
    onEndTurn?: () => void;
    onTrade?: () => void;
    onBuyDevelopmentCard?: () => void;
    onPlayDevelopmentCard?: () => void;
    phase: GamePhase
    placementAction?:
    | "settlement"
    | "road";
    lastDiceRoll?: number;
    availability?: ActionAvailability;
    diceOnly?: boolean;
    hideDice?: boolean;
    playerColor?: string;
    roadBuildingPending?: boolean;
    hasPlayableKnight?: boolean;
    superMenuIsOpen: boolean;
}
interface ActionButtonProps {
    label: string;
    feedbackClassName?: string;
    icon: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    rollDiceSize?: boolean;
}
function ActionButton({
    label,
    feedbackClassName,
    icon,
    active = false,
    disabled = false,
    onClick,
    rollDiceSize = false,
}: ActionButtonProps) {
    return (
        <button
            type="button"
            className={feedbackClassName}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: rollDiceSize ? "110px" : "94px",
                minWidth: rollDiceSize ? "110px" : "94px",
                height: rollDiceSize ? "76px" : "58px",
                minHeight: rollDiceSize ? "76px" : "58px",
                maxHeight: rollDiceSize ? "76px" : "58px",
                padding: rollDiceSize ? "8px" : "6px 7px",
                borderRadius: "8px",
                border: active
                    ? `3px solid ${ACTIVE_BUTTON_BORDER}`
                    : `3px solid ${DEFAULT_BUTTON_BORDER}`,
                background: active
                    ? ACTIVE_BUTTON_BACKGROUND
                    : disabled
                        ? DISABLED_BUTTON_BACKGROUND
                        : DEFAULT_BUTTON_BACKGROUND,
                color: disabled
                    ? "#666b63"
                    : active ? "#17130b" : "#f3ead5",
                cursor: disabled
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: rollDiceSize ? "5px" : "7px",
                transition:
                    "background 0.15s ease, border 0.15s ease, transform 0.15s ease",
                boxShadow: active ? "0 0 16px rgba(220,180,88,.22)" : "inset 0 1px 0 rgba(255,255,255,.035)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
            }}
        >
            <span
                style={{
                    fontSize: rollDiceSize ? "27px" : "22px",
                    lineHeight: 1,
                    display: "block",
                }}
            >
                {icon}
            </span>
            <span
                style={{
                    fontSize: rollDiceSize ? "11px" : "9px",
                    lineHeight: 1.05,
                    display: "block",
                    whiteSpace: "nowrap",
                    overflowWrap: "normal",
                    textAlign: "center",
                    maxWidth: "100%",
                }}
            >
                {label}
            </span>
        </button>
    );
}
function ActionBar({
    prosperityRollSequenceActive = false,
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
    roadBuildingPending = false,
    hasPlayableKnight = false,
    superMenuIsOpen = false,
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
    const canPlayDevCardButton =
        canPlayDevelopmentCard ||
        (
            isPlaying &&
            lastDiceRoll === undefined &&
            hasPlayableKnight
        );
    const actionBarLocked =
        prosperityRollSequenceActive || superMenuIsOpen;
    if (diceOnly) {
        return (
            <ActionButton
                icon="🎲"
                label={
                    lastDiceRoll !== undefined
                        ? `Rolled ${lastDiceRoll}`
                        : "Roll Dice"
                }
                active={
                    !actionBarLocked &&
                    canRoll &&
                    !roadBuildingPending
                }
                disabled={
                    actionBarLocked ||
                    !canRoll ||
                    roadBuildingPending
                }
                onClick={onRollDice}
                rollDiceSize
                feedbackClassName={lastDiceRoll !== undefined ? `feedback-dice-result${lastDiceRoll === 7 ? " feedback-dice-result--seven" : ""}` : undefined}
            />
        );
    }
    return (
        <div className="game-command-shell">
            <div className="game-command-tray"
                style={{
                    background: "linear-gradient(180deg, rgba(35,39,35,.98), rgba(17,20,18,.98))",
                    borderRadius: "14px",
                    padding: "10px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "nowrap",
                } as CSSProperties}
            >
                {!hideDice && (
                    <ActionButton
                        icon="🎲"
                        label={
                            lastDiceRoll !== undefined
                                ? `Rolled ${lastDiceRoll}`
                                : "Roll Dice"
                        }
                        active={canRoll && !actionBarLocked}
                        disabled={actionBarLocked || !canRoll}
                        onClick={onRollDice}
                        feedbackClassName={lastDiceRoll !== undefined ? `feedback-dice-result${lastDiceRoll === 7 ? " feedback-dice-result--seven" : ""}` : undefined}
                    />
                )}
                <ActionButton
                    icon="💰"
                    label="Trade"
                    active={canTrade && !actionBarLocked}
                    disabled={actionBarLocked || !canTrade}
                    onClick={onTrade}
                />
                <ActionButton
                    icon="🎴"
                    label="Buy Dev Card"
                    active={
                        canBuyDevelopmentCard &&
                        !actionBarLocked
                    }
                    disabled={
                        actionBarLocked ||
                        !canBuyDevelopmentCard
                    }
                    onClick={onBuyDevelopmentCard}
                />
                <ActionButton
                    icon="🃏"
                    label="Play Dev Card"
                    active={
                        canPlayDevCardButton &&
                        !actionBarLocked
                    }
                    disabled={
                        actionBarLocked ||
                        !canPlayDevCardButton
                    }
                    onClick={onPlayDevelopmentCard}
                />
                <ActionButton
                    icon="🛣️"
                    label="Road"
                    active={
                        !actionBarLocked &&
                        (
                            isInitialPlacement
                                ? placementAction === "road"
                                : canRoad
                        )
                    }
                    disabled={
                        actionBarLocked ||
                        (
                            isInitialPlacement
                                ? placementAction !== "road"
                                : !canRoad
                        )
                    }
                />
                <ActionButton
                    icon="🏠"
                    label="Settlement"
                    active={
                        !actionBarLocked &&
                        (
                            isInitialPlacement
                                ? placementAction === "settlement"
                                : canSettlement
                        )
                    }
                    disabled={
                        actionBarLocked ||
                        (
                            isInitialPlacement
                                ? placementAction !== "settlement"
                                : !canSettlement
                        )
                    }
                />
                <ActionButton
                    icon="🏙️"
                    label="City"
                    active={
                        canCity &&
                        !actionBarLocked
                    }
                    disabled={
                        actionBarLocked ||
                        !canCity
                    }
                />
                <ActionButton
                    icon="⏭️"
                    label="End Turn"
                    active={
                        canEndTurn &&
                        !actionBarLocked
                    }
                    disabled={
                        actionBarLocked ||
                        !canEndTurn
                    }
                    onClick={onEndTurn}
                />
            </div>
        </div>
    );
}
export default ActionBar;