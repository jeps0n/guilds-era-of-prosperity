import { useState, useEffect } from "react";
import { superOrchestrator } from "../application/super/superService";
import { areSuperResourcesOptional } from "../game/guilds/shared/areSuperResourcesOptional";
import type { GameState } from "../game/engine/GameState";
import ResourceSelectButton from "./super/ResourceSelectButton";
import GuildSuperOptions from "./super/GuildSuperOptions";
interface SuperMenuProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: (game: GameState) => void;
    game: GameState;
}
function SuperMenu({
    visible,
    title,
    onCancel,
    onConfirm,
    game,
}: SuperMenuProps) {
    // REACT STATE ***
    const [, setSelectionVersion] = useState(0);
    const [merchantCardsRevealed, setMerchantCardsRevealed] =
        useState(false);
    useEffect(() => {
        if (!visible) {
            setMerchantCardsRevealed(false);
        }
    }, [visible]);
    if (!visible) {
        return null;
    }
    // CURRENT PLAYER ***
    const currentPlayer = game.players.find(
        (player) => player.id === game.currentPlayerId
    );
    const currentPlayerColor = currentPlayer?.id === "player-1"
        ? "#f97316"
        : "#9333ea";
    // SHARED UI ***
    const selectionHeaderTextColor = "#ffffff"
    const selectionHeaderBackgroundColor = "rgba(0, 0, 0, 0.12)"
    // MERCHANT ***
    const isMerchant =
        currentPlayer?.guild === "merchant";
    const marketInsightCards = isMerchant
        ? superOrchestrator.getMarketInsightCards(game)
        : [];
    const showViewCards =
        isMerchant &&
        marketInsightCards.length > 0 &&
        !merchantCardsRevealed;
    const superResolutionLocked =
        isMerchant && merchantCardsRevealed;
    // RESOURCE SELECTION
    const resourceSelectionHeader =
        areSuperResourcesOptional(game)
            ? "(Optional) Pick up to 3 free resources:"
            : "Pick up to 3 free resources:";
    return (
        // OVERLAY
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "18px",
                background:
                    "rgba(8, 12, 20, 0.55)",
            }}
        >
            {/* *GOLD MENU */}
            <div
                className="super-menu__panel feedback-super-menu-arrival"
                style={{
                    position: "relative",
                    width: "500px",
                    minHeight: "388px",
                    height: "auto",
                    maxHeight: "calc(100% - 32px)",
                    boxSizing: "border-box",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "24px 24px 20px",
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
                    disabled={superResolutionLocked}
                    onClick={() => {
                        if (superResolutionLocked) {
                            return;
                        }
                        superOrchestrator.resetSelections();
                        setMerchantCardsRevealed(false);
                        onCancel();
                    }}
                    onMouseEnter={(e) => {
                        if (superResolutionLocked) {
                            return;
                        }
                        e.currentTarget.style.color =
                            "#ffffff";
                        e.currentTarget.style.borderColor =
                            "#FFF0B0";
                        e.currentTarget.style.background =
                            "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                    }}
                    onMouseLeave={(e) => {
                        if (superResolutionLocked) {
                            return;
                        }
                        e.currentTarget.style.color =
                            "#ffffff";
                        e.currentTarget.style.borderColor =
                            "rgba(232, 212, 154, 0.55)";
                        e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.03)";
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
                        background: superResolutionLocked
                            ? "rgba(80, 75, 65, 0.18)"
                            : "rgba(255, 255, 255, 0.03)",
                        border: superResolutionLocked
                            ? "1px solid rgba(156, 163, 175, 0.15)"
                            : "1px solid rgba(232, 212, 154, 0.55)",
                        borderRadius: "6px",
                        color: superResolutionLocked
                            ? "rgba(156, 163, 175, 0.45)"
                            : "#ffffff",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor: superResolutionLocked
                            ? "not-allowed"
                            : "pointer",
                        opacity: superResolutionLocked ? 0.55 : 1,
                        transition:
                            "color 0.15s ease, border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease",
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
                {/* RESOURCE SELECTION: STATIC SECTION */}
                <div>
                    {/* HEADER */}
                    <div
                        style={{
                            fontSize: "12px",
                            letterSpacing: "1px",
                            color: selectionHeaderTextColor,
                            margin: "2px",
                            // display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "69px",
                            backgroundColor: selectionHeaderBackgroundColor,
                        }}
                    >
                        {resourceSelectionHeader}
                    </div>
                    {/* GRID BUTTONS */}
                    <div
                        style={{
                            marginTop: "12px",
                            display: "grid",
                            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                            gridTemplateRows: "repeat(3, 1fr)",
                            gridAutoFlow: "column",
                            gap: "5px",
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
                </div>
                <GuildSuperOptions
                    game={game}
                    merchantCardsRevealed={merchantCardsRevealed}
                    onSelectionChange={() =>
                        setSelectionVersion((version) => version + 1)
                    }
                />
                <button
                    type="button"
                    onClick={() => {
                        if (showViewCards) {
                            setMerchantCardsRevealed(true);
                            return;
                        }
                        const nextGame =
                            superOrchestrator.confirmSuper(game);
                        if (nextGame !== game) {
                            onConfirm(nextGame);
                        }
                    }}
                    disabled={
                        showViewCards
                            ? false
                            : !superOrchestrator.canConfirmSuper(game)
                    }
                    onMouseEnter={(event) => {
                        if (showViewCards) {
                            event.currentTarget.style.background =
                                "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                            event.currentTarget.style.borderColor = "#FFF0B0";
                            event.currentTarget.style.boxShadow =
                                "0 0 10px rgba(212, 175, 85, 0.35)";
                            event.currentTarget.style.color = "#ffffff";
                        } else if (superOrchestrator.canConfirmSuper(game)) {
                            event.currentTarget.style.boxShadow = `
            0 0 10px rgba(212, 175, 85, 0.45),
            0 0 22px ${currentPlayerColor},
            0 0 38px ${currentPlayerColor}
        `;
                            event.currentTarget.style.color = "#ffffff";
                        }
                    }}
                    onMouseLeave={(event) => {
                        if (showViewCards) {
                            event.currentTarget.style.background = "#3A2A12";
                            event.currentTarget.style.borderColor = "#D4AF55";
                            event.currentTarget.style.boxShadow = "none";
                            event.currentTarget.style.color = "#FFF8DF";
                        } else {
                            event.currentTarget.style.boxShadow =
                                "0 4px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)";
                            event.currentTarget.style.color =
                                superOrchestrator.canConfirmSuper(game)
                                    ? "#241805"
                                    : "#8a7a55";
                        }
                    }}
                    style={{
                        margin: "16px auto 0",
                        flex: "0 0 auto",
                        minWidth: "165px",
                        maxWidth: "165px",
                        height: "42px",
                        padding: "0 28px",
                        borderRadius: "21px",
                        border: showViewCards
                            ? "2px solid #D4AF55"
                            : superOrchestrator.canConfirmSuper(game)
                                ? `3px solid ${currentPlayerColor}`
                                : "2px solid #D4AF55",
                        background:
                            showViewCards
                                ? `
                    linear-gradient(
                        180deg,
                        #6F5424 0%,
                        #5A431D 50%,
                        #3A2A12 100%
                    )
                `
                                : superOrchestrator.canConfirmSuper(game)
                                    ? `
                        linear-gradient(
                            180deg,
                            #F1D77A 0%,
                            #D4AF55 45%,
                            #9F7B2F 100%
                        )
                    `
                                    : "#3A2A12",
                        color:
                            showViewCards
                                ? "#FFF8DF"
                                : superOrchestrator.canConfirmSuper(game)
                                    ? "#241805"
                                    : "#8a7a55",
                        fontWeight: "900",
                        fontSize: "13px",
                        letterSpacing: "1.75px",
                        cursor:
                            showViewCards ||
                                superOrchestrator.canConfirmSuper(game)
                                ? "pointer"
                                : "not-allowed",
                        boxShadow:
                            showViewCards
                                ? `
                    0 4px 8px rgba(0, 0, 0, 0.35),
                    inset 0 1px 0 rgba(255,255,255,0.25)
                `
                                : superOrchestrator.canConfirmSuper(game)
                                    ? `
                        0 4px 8px rgba(0, 0, 0, 0.35),
                        inset 0 1px 0 rgba(255,255,255,0.25)
                    `
                                    : "none",
                        textShadow:
                            showViewCards
                                ? "none"
                                : superOrchestrator.canConfirmSuper(game)
                                    ? "0 1px 1px rgba(255,255,255,0.25)"
                                    : "none",
                        transition:
                            "box-shadow 0.2s ease, transform 0.2s ease",
                    }}
                >
                    {showViewCards ? "VIEW CARDS" : "CONFIRM"}
                </button>
            </div>
        </div>
    );
}
export default SuperMenu;
