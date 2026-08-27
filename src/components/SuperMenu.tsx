import { useState, useEffect } from "react";
import { SuperOrchestrator } from "../game/guilds/SuperOrchestrator";
import { areSuperResourcesOptional } from "../game/guilds/shared/areSuperResourcesOptional";
import type { GameState } from "../game/engine/GameState";
import type { Resources } from "../game/engine/types";
interface SuperMenuProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: (game: GameState) => void;
    game: GameState;
}
export const superOrchestrator = new SuperOrchestrator();
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
    const cardLabels: Record<string, string> = {
        knight: "Knight",
        victory_point: "Victory Point",
        road_building: "Road Building",
        year_of_plenty: "Year of Plenty",
        monopoly: "Monopoly",
    };
    const marketInsightCards = isMerchant
        ? superOrchestrator.getMarketInsightCards(game)
        : [];
    const showViewCards =
        isMerchant &&
        marketInsightCards.length > 0 &&
        !merchantCardsRevealed;
    const merchantSelectionHeader =
        game.developmentDeck.length >= 3
            ? "Pick 2 free dev cards, 1 goes back on top of development deck: "
            : game.developmentDeck.length === 0
                ? "There are no more dev cards left in the development deck."
                : game.developmentDeck.length === 1
                    ? "There is " + game.developmentDeck.length + " dev card left in the development deck. You will get: "
                    // game.developmentDeck.length === 2
                    : "There are " + game.developmentDeck.length + " dev cards left in the development deck. You will get: ";
    // EXPLORER ***
    const isExplorer =
        currentPlayer?.guild === "explorer";
    const grandExpeditionRoadsToPlace = isExplorer
        ? superOrchestrator.getGrandExpedition(game).roadsToPlace
        : undefined;
    const grandExpeditionRoadCards =
        grandExpeditionRoadsToPlace
            ? Array.from(
                { length: grandExpeditionRoadsToPlace },
                (_, index) => ({
                    id: `grand-expedition-road-${index}`,
                    type: "road",
                    active: true,
                })
            )
            : [];
    const explorerSelectionHeader =
        grandExpeditionRoadsToPlace === 0
            ? "No roads can be placed."
            : grandExpeditionRoadsToPlace === 1
                ? "You will place " + grandExpeditionRoadsToPlace + " free road."
                : "You will place " + grandExpeditionRoadsToPlace + " free roads.";
    // BUILDER ***
    const isBuilder =
        currentPlayer?.guild === "builder";
    const masterBuilderWhatToBuild =
        superOrchestrator.getMasterBuilder(game);
    const selectedMasterBuilder =
        superOrchestrator.getSelectedMasterBuilder();
    const assumedMasterBuilder =
        superOrchestrator.getAssumedMasterBuilderSelection(game);
    const builderSelectionHeader =
        assumedMasterBuilder !== undefined
            ? "You will build: "
            : "Choose 1 to build: ";
    // RESOURCE SELECTION
    const resourceSelectionHeader =
        areSuperResourcesOptional(game)
            ? "(Optional) Pick up to 3 free resources: "
            : "Pick up to 3 free resources: ";
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
                style={{
                    position: "relative",
                    width: "500px",
                    height: "388px",
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
                        setMerchantCardsRevealed(false);
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
                {/* GUILD SECTION: DYNAMIC SECTION */}
                <div
                    style={{
                        minHeight: "100px",
                    }}>
                    {/* MERCHANT *SUB-MENU */}
                    {isMerchant && (
                        <>
                            {/* HEADER */}
                            <div
                                style={{
                                    marginTop: "12px",
                                    fontSize: "12px",
                                    letterSpacing: "1px",
                                    color: selectionHeaderTextColor,
                                    padding: "4px 10px",
                                    borderRadius: "69px",
                                    backgroundColor: selectionHeaderBackgroundColor,
                                }}
                            >
                                {merchantSelectionHeader}
                            </div>
                            {/* DEVELOPMENT CARDS */}
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
                                            disabled={
                                                !merchantCardsRevealed ||
                                                autoSelected
                                            }
                                            onClick={() => {
                                                if (
                                                    !merchantCardsRevealed ||
                                                    autoSelected
                                                ) {
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
                                                minWidth: "105px",
                                                minHeight: "70px",
                                                padding: "6px",
                                                borderRadius: "10px",
                                                border:
                                                    merchantCardsRevealed &&
                                                        (card.active ||
                                                            autoSelected)
                                                        ? "2px solid #FFF0B0"
                                                        : "2px solid #D4AF55",
                                                background:
                                                    !merchantCardsRevealed
                                                        ? "#3A2A12"
                                                        : card.active || autoSelected
                                                            ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                                            : "#3A2A12",
                                                color: "#FFF8DF",
                                                cursor:
                                                    !merchantCardsRevealed ||
                                                        autoSelected
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontWeight:
                                                    merchantCardsRevealed &&
                                                        (card.active || autoSelected)
                                                        ? "bold"
                                                        : "normal",
                                                fontSize: "11px",
                                                letterSpacing: "1px",
                                                textTransform: "none",
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            {merchantCardsRevealed ? (
                                                cardLabels[card.type] ??
                                                card.type
                                            ) : (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "100%",
                                                        height: "100%",
                                                        boxSizing: "border-box",
                                                        borderRadius: "6px",
                                                        background:
                                                            "linear-gradient(145deg, #241805, #6F5424 45%, #3A2A12)",
                                                        border:
                                                            "1px solid rgba(255, 240, 176, 0.35)",
                                                        color: "#D4AF55",
                                                        fontSize: "18px",
                                                        fontWeight: "900",
                                                    }}
                                                >
                                                    ?
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {/* EXPLORER *SUB-MENU */}
                    {isExplorer && (
                        <>
                            {/* HEADER */}
                            <div
                                style={{
                                    marginTop: "12px",
                                    fontSize: "12px",
                                    letterSpacing: "1px",
                                    color: selectionHeaderTextColor,
                                    padding: "4px 10px",
                                    borderRadius: "69px",
                                    backgroundColor:
                                        selectionHeaderBackgroundColor,
                                }}
                            >
                                {explorerSelectionHeader}
                            </div>
                            {/* GRAND EXPEDITION ROAD CARDS */}
                            <div
                                style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {grandExpeditionRoadCards.map((card) => (
                                    <button
                                        key={card.id}
                                        type="button"
                                        disabled={true}
                                        style={{
                                            width: "105px",
                                            height: "70px",
                                            padding: "6px",
                                            borderRadius: "10px",
                                            border: "2px solid #FFF0B0",
                                            background:
                                                "linear-gradient(180deg, #D4AF55, #9F7B2F)",
                                            color: "#FFF8DF",
                                            cursor: "not-allowed",
                                            fontWeight: "bold",
                                            fontSize: "11px",
                                            letterSpacing: "1px",
                                            textTransform: "none",
                                        }}
                                    >
                                        Road
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {/* BUILDER SUB-MENU */}
                    {isBuilder && (
                        <>
                            {/* HEADER */}
                            <div
                                style={{
                                    marginTop: "12px",
                                    fontSize: "12px",
                                    letterSpacing: "1px",
                                    color: selectionHeaderTextColor,
                                    padding: "4px 10px",
                                    borderRadius: "69px",
                                    backgroundColor:
                                        selectionHeaderBackgroundColor,
                                }}
                            >
                                {builderSelectionHeader}
                            </div>
                            {/* BUILDING OPTIONS */}
                            <div
                                style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {(
                                    [
                                        {
                                            id: "settlement",
                                            label: "Settlement",
                                            available:
                                                masterBuilderWhatToBuild.canBuildSettlement,
                                        },
                                        {
                                            id: "city",
                                            label: "City",
                                            available:
                                                masterBuilderWhatToBuild.canBuildCity,
                                        },
                                    ] as const
                                ).map((option) => {
                                    const active =
                                        selectedMasterBuilder === option.id ||
                                        (
                                            selectedMasterBuilder === undefined &&
                                            assumedMasterBuilder === option.id
                                        );
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={
                                                !option.available ||
                                                (
                                                    selectedMasterBuilder === undefined &&
                                                    assumedMasterBuilder === option.id
                                                )
                                            }
                                            onClick={() => {
                                                if (!option.available) {
                                                    return;
                                                }
                                                superOrchestrator.toggleMasterBuilderSelection(
                                                    option.id
                                                );
                                                setSelectionVersion(
                                                    (version) => version + 1
                                                );
                                            }}
                                            onMouseEnter={(event) => {
                                                if (option.available) {
                                                    event.currentTarget.style.background =
                                                        "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                                                    event.currentTarget.style.borderColor =
                                                        "#FFF0B0";
                                                    event.currentTarget.style.boxShadow =
                                                        "0 0 10px rgba(212, 175, 85, 0.35)";
                                                }
                                            }}
                                            onMouseLeave={(event) => {
                                                if (option.available) {
                                                    event.currentTarget.style.background =
                                                        active
                                                            ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                                            : "#3A2A12";
                                                    event.currentTarget.style.borderColor =
                                                        active
                                                            ? "#FFF0B0"
                                                            : "#D4AF55";
                                                    event.currentTarget.style.boxShadow =
                                                        "none";
                                                }
                                            }}
                                            style={{
                                                width: "105px",
                                                height: "70px",
                                                padding: "6px",
                                                borderRadius: "10px",
                                                border: active
                                                    ? "2px solid #FFF0B0"
                                                    : "2px solid #D4AF55",
                                                background: active
                                                    ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                                    : option.available
                                                        ? "#3A2A12"
                                                        : "#211C14",
                                                color: option.available
                                                    ? "#FFF8DF"
                                                    : "#6f6655",
                                                cursor:
                                                    !option.available ||
                                                        (
                                                            selectedMasterBuilder === undefined &&
                                                            assumedMasterBuilder === option.id
                                                        )
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontWeight: active
                                                    ? "bold"
                                                    : "normal",
                                                fontSize: "11px",
                                                letterSpacing: "1px",
                                                textTransform: "none",
                                                opacity: option.available
                                                    ? 1
                                                    : 0.55,
                                                transition:
                                                    "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
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
                        margin: "16px 0px",
                        minWidth: "165px",
                        maxWidth: "165px",
                        height: "42px",
                        padding: "0 28px",
                        borderRadius: "21px",
                        border: "2px solid #D4AF55",
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
                height: "42px",
                padding: "0px 8px",
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