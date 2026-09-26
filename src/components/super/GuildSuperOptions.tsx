import { superOrchestrator } from "../../application/super/superService";
import type { GameState } from "../../game/engine/GameState";
interface GuildSuperOptionsProps {
  game: GameState;
  merchantCardsRevealed: boolean;
  onSelectionChange: () => void;
}
const cardLabels: Record<string, string> = {
  knight: "Knight",
  victory_point: "Victory Point",
  road_building: "Road Building",
  year_of_plenty: "Year of Plenty",
  monopoly: "Monopoly",
};
export default function GuildSuperOptions({ game, merchantCardsRevealed, onSelectionChange }: GuildSuperOptionsProps) {
  const currentPlayer = game.players.find((player) => player.id === game.currentPlayerId);
  const isMerchant = currentPlayer?.guild === "merchant";
  const isExplorer = currentPlayer?.guild === "explorer";
  const isBuilder = currentPlayer?.guild === "builder";
  const marketInsightCards = isMerchant ? superOrchestrator.getMarketInsightCards(game) : [];
  const merchantSelectionHeader = marketInsightCards.length >= 3
    ? "Pick 2 free dev cards, 1 goes back on top of development deck:"
    : marketInsightCards.length === 2
      ? "There are " + game.developmentDeck.length + " dev cards left in the development deck. You will get:"
      : marketInsightCards.length === 1
        ? "There is " + game.developmentDeck.length + " dev card left in the development deck. You will get:"
        : "There are no more dev cards left in the development deck.";
  const grandExpeditionRoadsToPlace = isExplorer ? superOrchestrator.getGrandExpedition(game).roadsToPlace : undefined;
  const grandExpeditionRoadCards = grandExpeditionRoadsToPlace
    ? Array.from({ length: grandExpeditionRoadsToPlace }, (_, index) => ({ id: `grand-expedition-road-${index}` }))
    : [];
  const explorerSelectionHeader = grandExpeditionRoadsToPlace === 0
    ? "No valid roads can be placed."
    : grandExpeditionRoadsToPlace === 1
      ? "You will place " + grandExpeditionRoadsToPlace + " free road."
      : "You will place " + grandExpeditionRoadsToPlace + " free roads.";
  const masterBuilderOptions = superOrchestrator.getMasterBuilder(game);
  const selectedMasterBuilder = superOrchestrator.getSelectedMasterBuilder();
  const assumedMasterBuilder = superOrchestrator.getAssumedMasterBuilderSelection(game);
  const builderSelectionHeader = assumedMasterBuilder !== undefined
    ? "You will build:"
    : !masterBuilderOptions.canBuildCity && !masterBuilderOptions.canBuildSettlement
      ? "No valid buildings can be built."
      : "Choose 1 to build:";
  const selectionHeaderTextColor = "#ffffff";
  const selectionHeaderBackgroundColor = "rgba(0, 0, 0, 0.12)";
  return (
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
                    const autoSelected = marketInsightCards.length < 3;
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
                                onSelectionChange();
                            }}
                            onMouseEnter={(event) => {
                                if (merchantCardsRevealed && !autoSelected) {
                                    event.currentTarget.style.background =
                                        "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                                    event.currentTarget.style.borderColor =
                                        "#FFF0B0";
                                    event.currentTarget.style.boxShadow =
                                        "0 0 10px rgba(212, 175, 85, 0.35)";
                                }
                            }}
                            onMouseLeave={(event) => {
                                if (merchantCardsRevealed && !autoSelected) {
                                    event.currentTarget.style.background =
                                        card.active
                                            ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                                            : "#3A2A12";
                                    event.currentTarget.style.borderColor =
                                        card.active
                                            ? "#FFF0B0"
                                            : "#D4AF55";
                                    event.currentTarget.style.boxShadow =
                                        "none";
                                }
                            }}
                            style={{
                                width: "110px",
                                height: "70px",
                                minWidth: "110px",
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
                            width: "110px",
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
                                masterBuilderOptions.canBuildSettlement,
                        },
                        {
                            id: "city",
                            label: "City",
                            available:
                                masterBuilderOptions.canBuildCity,
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
                                onSelectionChange();
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
                                width: "110px",
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
  );
}
