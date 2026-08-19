import { useState } from "react";
import { SuperOrchestrator } from "../game/guilds/SuperOrchestrator";
import type { GameState } from "../game/engine/GameState";
import type { Resources } from "../game/engine/types";
interface SuperMenuProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: (game: GameState) => void;
    game: GameState;
}
const superOrchestrator = new SuperOrchestrator();
function SuperMenu({
    visible,
    title,
    onCancel,
    onConfirm,
    game,
}: SuperMenuProps) {
    if (!visible) {
        return null;
    }
    const [, setSelectionVersion] = useState(0);
    const currentPlayer = game.players.find(
        (player) => player.id === game.currentPlayerId
    );
    const isMerchant =
        currentPlayer?.guild === "merchant";
    const marketInsightCards = isMerchant
        ? superOrchestrator.getMarketInsightCards(game)
        : [];
    const resourceSelectionHeader = "Pick up to 3 free resources: "
    const merchantSelectionHeader = game.developmentDeck.length >= 3
        ? "Pick 2 free dev cards, 1 goes back on top of development deck: "
        : "There is less than 3 dev cards in development deck. You will get: ";
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "18px",
                background: "rgba(8, 12, 20, 0.72)",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "420px",
                    height: "360px",
                    padding: "24px",
                    textAlign: "center",
                    userSelect: "none",
                    background:
                        "linear-gradient(145deg, #241805, #6F5424 35%, #B89545 50%, #6F5424 65%, #241805)",
                    border: "3px solid #D4AF55",
                    borderRadius: "20px",
                    boxShadow: `
                        0 0 20px rgba(212, 175, 85, 0.55),
                        0 0 45px rgba(212, 175, 85, 0.28),
                        inset 0 0 18px rgba(255, 220, 130, 0.16),
                        inset 0 0 0 1px rgba(255, 239, 190, 0.5)
                    `,
                    color: "#FFF8DF",
                }}
            >
                {/* CANCEL */}
                <button
                    type="button"
                    onClick={() => {
                        superOrchestrator.resetSelections();
                        onCancel();
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color =
                            "#D4AF55";
                        e.currentTarget.style.borderColor =
                            "#D4AF55";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                            "#ffffff";
                        e.currentTarget.style.borderColor =
                            "rgba(156, 163, 175, 0.3)";
                    }}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "28px",
                        height: "28px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border:
                            "1px solid rgba(156, 163, 175, 0.3)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition:
                            "color 0.15s ease, border-color 0.15s ease",
                    }}
                >
                    ×
                </button>
                {/* TITLE */}
                <h2
                    style={{
                        margin: "4px",
                        color: "#FFF8DF",
                        fontSize: "28px",
                        fontWeight: "900",
                        letterSpacing: "2px",
                    }}
                >
                    {title}
                </h2>
                <div
                    style={{
                        fontSize: "12px",
                        letterSpacing: "1px",
                        color: "#D8BD72",
                        margin: "2px",
                    }}
                >
                    {resourceSelectionHeader}
                </div>
                {/* RESOURCE BUTTON GRID */}
                <div
                    style={{
                        marginTop: "12px",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gridTemplateRows: "repeat(3, 1fr)",
                        gridAutoFlow: "column",
                        gap: "3px",
                    }}
                >
                    {superOrchestrator.getSuperButtons(game).map((button) => (
                        <ResourceSelectButton
                            key={button.id}
                            disabled={button.disabled}
                            active={button.active}
                            resource={button.resource}
                            onClick={() => {
                                superOrchestrator.toggleButton(
                                    button.id
                                );
                                setSelectionVersion(
                                    (version) =>
                                        version + 1
                                );
                            }}
                        >
                            {button.label}
                        </ResourceSelectButton>
                    ))}
                </div>
                {/* MERCHANT *SUB-MENU */}
                {isMerchant && (
                    <>
                        <div
                            style={{
                                marginTop: "12px",
                                fontSize: "12px",
                                letterSpacing: "1px",
                                color: "#D8BD72",
                            }}
                        >
                            {merchantSelectionHeader}
                        </div>
                        <div
                            style={{
                                marginTop: "12px",
                                display: "flex",
                                justifyContent: "center",
                                gap: "8px",
                            }}
                        >
                            {marketInsightCards.map((card) => {
                                const autoSelected =
                                    marketInsightCards.length < 3;
                                return (
                                    <button
                                        key={card.id}
                                        type="button"
                                        disabled={autoSelected}
                                        onClick={() => {
                                            if (autoSelected) {
                                                return;
                                            }
                                            superOrchestrator.toggleMarketInsightCard(
                                                card.id
                                            );
                                            setSelectionVersion(
                                                (version) =>
                                                    version + 1
                                            );
                                        }}
                                        style={{
                                            width: "105px",
                                            height: "70px",
                                            padding: "6px",
                                            borderRadius: "10px",
                                            border:
                                                card.active ||
                                                    autoSelected
                                                    ? "2px solid #FFF0B0"
                                                    : "2px solid #D4AF55",
                                            background:
                                                card.active ||
                                                    autoSelected
                                                    ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                                    : "#3A2A12",
                                            color: "#FFF8DF",
                                            cursor:
                                                autoSelected
                                                    ? "not-allowed"
                                                    : "pointer",
                                            fontWeight: autoSelected
                                                ? "bold"
                                                : "normal",
                                            fontSize: "11px",
                                            textTransform:
                                                "none",
                                        }}
                                    >
                                        {card.type}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
                <button
                    type="button"
                    onClick={() => {
                        const nextGame =
                            superOrchestrator.confirmSuper(game);
                        if (nextGame !== game) {
                            onConfirm(nextGame);
                        }
                    }}
                    disabled={
                        !superOrchestrator.canConfirmSuper(game)
                    }
                    style={{
                        marginTop: "12px",
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "1px solid #D4AF55",
                        background:
                            superOrchestrator.canConfirmSuper(game)
                                ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                : "#3A2A12",
                        color:
                            superOrchestrator.canConfirmSuper(game)
                                ? "#FFF8DF"
                                : "#8a7a55",
                        fontWeight: "bold",
                        cursor:
                            superOrchestrator.canConfirmSuper(game)
                                ? "pointer"
                                : "not-allowed",
                    }}
                >
                    CONFIRM
                </button>
            </div>
        </div>
    );
}
export default SuperMenu;
interface ResourceSelectButtonProps {
    resource: keyof Resources;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
}
function ResourceSelectButton({
    resource,
    children,
    onClick,
    active = false,
    disabled = false,
}: ResourceSelectButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={(event) => {
                if (!disabled) {
                    event.currentTarget.style.background =
                        "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                    event.currentTarget.style.borderColor =
                        "#FFF0B0";
                    event.currentTarget.style.boxShadow =
                        "0 0 10px rgba(212, 175, 85, 0.35)";
                }
            }}
            onMouseLeave={(event) => {
                if (!disabled) {
                    event.currentTarget.style.background =
                        active
                            ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                            : "linear-gradient(180deg, #6F5424, #3A2A12)";
                    event.currentTarget.style.borderColor =
                        active
                            ? "#FFF0B0"
                            : "#D4AF55";
                    event.currentTarget.style.boxShadow =
                        "none";
                }
            }}
            style={{
                fontSize: "11px",
                width: "100%",
                // minWidth: "90px",
                height: "42px",
                padding: "3px",
                borderRadius: "10px",
                border: active
                    ? "2px solid #FFF0B0"
                    : "2px solid #D4AF55",
                background: active
                    ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                    : "#3A2A12",
                color: disabled
                    ? "#8a7a55"
                    : "#FFF8DF",
                cursor: disabled
                    ? "not-allowed"
                    : "pointer",
                fontWeight: active
                    ? "bold"
                    : "normal",
                textAlign: "left",
                transition:
                    "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            }}
        >
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "19px",
                        width: "19px",
                        height: "19px",
                        padding: "2px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        flexShrink: 0,
                        backgroundColor: disabled
                            ? "#3f3a30"
                            : resourceColors[resource],
                        color: disabled
                            ? "#766f61"
                            : "#000000",
                    }}
                >
                    1
                </span>
                <span
                    style={{
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {children}
                </span>
            </span>
        </button>
    );
}
const resourceColors: Record<
    keyof Resources,
    string
> = {
    brick: "#b45309",
    lumber: "#166534",
    wheat: "#eab308",
    sheep: "#65a30d",
    ore: "#6b7280",
};