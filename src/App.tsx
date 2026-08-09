import { useState, useEffect } from "react";
import ActionBar from "./components/ActionBar";
import BoardView from "./components/BoardView";
import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import GameLayout from "./components/layout/GameLayout";
import GameLog from "./components/GameLog";
import PlayerPanel from "./components/PlayerPanel";
import { createInitialState } from "./game/engine/initialState";
import {
    validateBoard,
} from "./game/engine/boardValidation/validateBoard";
import {
    selectGuild,
} from "./game/systems/guildSelection";
import {
    placeSettlement,
} from "./game/systems/initialPlacement/placeSettlement";
import {
    placeRoad,
} from "./game/systems/initialPlacement/placeRoad";
import {
    endTurn,
} from "./game/systems/turn/endTurn";
import {
    rollDice,
} from "./game/systems/turn/rollDice";
import type {
    GuildType,
    Resources,
} from "./game/engine/types";
import {
    savePhaseCheckpoint,
    restorePhaseCheckpoint,
    canRestorePhaseCheckpoint,
} from "./store/gameStore";
import {
    getActionAvailability,
} from "./game/systems/actions/getActionAvailability";
import {
    buildRoad,
} from "./game/systems/building/buildRoad";
import {
    buildSettlement,
} from "./game/systems/building/buildSettlement";
import {
    buildCity,
} from "./game/systems/building/buildCity";
import {
    bankTrade,
} from "./game/systems/trading/bankTrade";
const initialGame = createInitialState();
if (import.meta.env.DEV) {
    validateBoard(initialGame.board);
}
import { getTradeRatio } from "./game/systems/trading/getTradeRatio";
function App() {
    const [game, setGame] = useState(initialGame);
    const [tradeOpen, setTradeOpen] = useState(false);
    const [selectedGiveResource, setSelectedGiveResource] =
        useState<keyof Resources | undefined>(undefined);
    useEffect(() => {
        console.log("========== GAME STATE UPDATED ==========");
        console.log("Phase:", game.phase);
        console.log("Current Player:", game.currentPlayerId);
        console.log("Placement Action:", game.placementAction);
        console.log("Last Dice Roll:", game.lastDiceRoll);
        console.log("+++Robber Pending+++:", game.robberPending);
        console.log("+++Robber Tile ID+++:", game.robberTileId);
        console.log("Players:", game.players);
        game.players.forEach((player) => {
            console.log(`--- ${player.name} (${player.id}) ---`);
            console.log("Resources:", player.resources);
            console.log("Settlements:", player.settlements);
            console.log("Roads:", player.roads);
            console.log("Cities:", player.cities);
            console.log("VP:", player.vp);
        });
        console.log("----------------------------------------");
        console.log("Board:", game.board);
        console.log("Resource Bank:", game.resourceBank);
        console.log("Event Log:", game.eventLog);
        console.log("========================================");
    }, [game]);
    function handleGuildSelection(guild: GuildType) {
        const nextGame = selectGuild(
            game,
            game.currentPlayerId,
            guild
        );
        if (nextGame === game) {
            return;
        }
        savePhaseCheckpoint(game);
        setGame(nextGame);
        if (nextGame.phase !== game.phase) {
            savePhaseCheckpoint(nextGame);
        }
    }
    function handlePlaceSettlement(nodeId: string) {
        const nextGame = placeSettlement(
            game,
            game.currentPlayerId,
            nodeId
        );
        if (nextGame === game) {
            return;
        }
        savePhaseCheckpoint(game);
        setGame(nextGame);
    }
    function handlePlaceRoad(edgeId: string) {
        const nextGame = placeRoad(
            game,
            game.currentPlayerId,
            edgeId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        if (nextGame.phase !== game.phase) {
            savePhaseCheckpoint(nextGame);
        }
    }
    function handleBuildRoad(edgeId: string) {
        const nextGame = buildRoad(
            game,
            game.currentPlayerId,
            edgeId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleBuildCity(nodeId: string) {
        const nextGame = buildCity(
            game,
            game.currentPlayerId,
            nodeId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleBankTrade(
        giveResource: keyof Resources,
        receiveResource: keyof Resources
    ) {
        const nextGame = bankTrade(
            game,
            game.currentPlayerId,
            giveResource,
            receiveResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleTrade() {
        const player = game.players.find(
            (candidate) =>
                candidate.id === game.currentPlayerId
        );
        if (!player) {
            return;
        }
        setSelectedGiveResource(undefined);
        setTradeOpen(true);
    }
    function handleSelectGiveResource(
        resource: keyof Resources
    ) {
        setSelectedGiveResource(resource);
    }
    function handleSelectReceiveResource(
        resource: keyof Resources
    ) {
        if (!selectedGiveResource) {
            return;
        }
        handleBankTrade(
            selectedGiveResource,
            resource
        );
        handleCloseTrade();
    }
    function handleCloseTrade() {
        setTradeOpen(false);
        setSelectedGiveResource(undefined);
    }
    function handleRollDice() {
        console.log("=== UI ROLL CLICK ===");

        console.log("Game BEFORE roll:", {
            phase: game.phase,
            currentPlayerId: game.currentPlayerId,
            lastDiceRoll: game.lastDiceRoll,
            robberPending: game.robberPending,
            robberTileId: game.robberTileId,
        });

        const nextGame = rollDice(game);

        console.log("Game AFTER rollDice():", {
            sameObject: nextGame === game,
            lastDiceRoll: nextGame.lastDiceRoll,
            robberPending: nextGame.robberPending,
            robberTileId: nextGame.robberTileId,
        });

        if (nextGame === game) {
            console.log("ROLL REJECTED — same game object returned");
            return;
        }

        setGame(nextGame);
    }
    function handleEndTurn() {
        const nextGame = endTurn(game);
        if (nextGame === game) {
            return;
        }
        handleCloseTrade();
        setGame(nextGame);
        savePhaseCheckpoint(nextGame);
    }
    function handleRestoreCheckpoint() {
        const restoredGame = restorePhaseCheckpoint(game);
        if (!restoredGame) {
            return;
        }
        setGame(restoredGame);
    }
    const currentPlayer = game.players.find(
        (player) =>
            player.id === game.currentPlayerId
    );
    const currentPlayerColor =
        currentPlayer?.id === "player-1"
            ? "#f97316"
            : "#9333ea";
    const availableGuilds: GuildType[] = (
        [
            "builder",
            "explorer",
            "merchant",
        ] as GuildType[]
    ).filter(
        (guild) =>
            !game.players.some(
                (player) =>
                    player.guild === guild
            )
    );
    const roads = game.players.flatMap(
        (player) =>
            player.roads.map(
                (edgeId, index) => ({
                    id: `${player.id}-road-${index}`,
                    edgeId,
                    playerId: player.id,
                })
            )
    );
    const cities = game.players.flatMap(
        (player) =>
            player.cities.map((nodeId) => ({
                nodeId,
                playerId: player.id,
            }))
    );
    const restoreAvailable =
        canRestorePhaseCheckpoint(game);
    const actionAvailability =
        getActionAvailability(game);
    const tradeResources: (keyof Resources)[] = [
        "brick",
        "lumber",
        "wheat",
        "sheep",
        "ore",
    ];
    const resourceColors: Record<keyof Resources, string> = {
        brick: "#b45309",
        lumber: "#166534",
        wheat: "#eab308",
        sheep: "#65a30d",
        ore: "#6b7280",
    };
    function renderResourceBadge(
        resource: keyof Resources,
        amount: number
    ) {
        return (
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "22px",
                    height: "22px",
                    padding: "0 5px",
                    borderRadius: "6px",
                    backgroundColor: resourceColors[resource],
                    color: "#000000",
                    fontSize: "12px",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                }}
            >
                {amount}
            </span>
        );
    }
    const tradeGiveOptions =
        currentPlayer
            ? tradeResources.filter((resource) => {
                const ratio = getTradeRatio(
                    game,
                    currentPlayer.id,
                    resource
                );
                return (
                    currentPlayer.resources[resource] >= ratio
                );
            })
            : [];
    const tradeReceiveOptions =
        selectedGiveResource
            ? tradeResources.filter(
                (resource) =>
                    resource !== selectedGiveResource &&
                    game.resourceBank[resource] >= 1
            )
            : [];
    function renderActionBar(
        options: {
            diceOnly?: boolean;
            hideDice?: boolean;
        } = {}
    ) {
        return (
            <ActionBar
                playerColor={currentPlayerColor}
                phase={game.phase}
                placementAction={
                    game.placementAction
                }
                lastDiceRoll={
                    game.lastDiceRoll
                }
                availability={
                    actionAvailability
                }
                onRollDice={
                    handleRollDice
                }
                onEndTurn={
                    handleEndTurn
                }
                onTrade={
                    handleTrade
                }
                {...options}
            />
        );
    }
    /*
     * GUILD SELECTION
     */
    if (
        game.phase === "guild_selection" &&
        currentPlayer &&
        currentPlayer.guild === undefined
    ) {
        return (
            <GameLayout
                header="Guilds: Era of Prosperity"
                board={
                    <GuildSelection
                        playerName={
                            currentPlayer.name
                        }
                        availableGuilds={
                            availableGuilds
                        }
                        onSelectGuild={
                            handleGuildSelection
                        }
                    />
                }
                rightSidebar={
                    <>
                        <GameStatus
                            game={game}
                            onRestoreCheckpoint={
                                handleRestoreCheckpoint
                            }
                            canRestoreCheckpoint={
                                restoreAvailable
                            }
                        />
                        <GameLog game={game} />
                    </>
                }
            />
        );
    }
    /*
     * INITIAL PLACEMENT / PLAYING
     */
    console.log("### APP → BOARDVIEW ###", {
        gameRobberPending: game.robberPending,
        gameRobberTileId: game.robberTileId,
        gameLastDiceRoll: game.lastDiceRoll,
        boardTileCount: game.board?.tiles?.length,
    });
    return (
        <GameLayout
            header="Guilds: Era of Prosperity"
            board={
                <div
                    style={{
                        position: "relative",
                        width: "800px",
                        height: "600px",
                    }}
                >

                    <BoardView
                        board={game.board}
                        settlements={game.players.flatMap(
                            (player) =>
                                player.settlements
                        )}
                        cities={cities}
                        roads={roads}

                        robberPending={game.robberPending}
                        robberTileId={game.robberTileId}

                        onSelectNode={
                            game.phase ===
                                "initial_placement" &&
                                game.placementAction ===
                                "settlement"
                                ? handlePlaceSettlement
                                : game.phase ===
                                    "playing"
                                    ? (nodeId) => {
                                        const ownsSettlement =
                                            currentPlayer?.settlements.some(
                                                (settlement) =>
                                                    settlement.nodeId === nodeId
                                            );

                                        if (ownsSettlement) {
                                            handleBuildCity(nodeId);
                                            return;
                                        }

                                        setGame(
                                            buildSettlement(
                                                game,
                                                game.currentPlayerId,
                                                nodeId
                                            )
                                        );
                                    }
                                    : undefined
                        }

                        onSelectEdge={
                            game.phase ===
                                "initial_placement" &&
                                game.placementAction ===
                                "road"
                                ? handlePlaceRoad
                                : game.phase ===
                                    "playing" &&
                                    actionAvailability.canRoad
                                    ? handleBuildRoad
                                    : undefined
                        }
                    />
                    {tradeOpen &&
                        game.phase === "playing" && (
                            <div
                                style={{
                                    position:
                                        "absolute",
                                    bottom: "16px",
                                    left: "16px",
                                    width: "280px",
                                    padding: "16px",
                                    borderRadius:
                                        "14px",
                                    border:
                                        "1px solid #374151",
                                    background:
                                        "#111827",
                                    color: "white",
                                    boxShadow:
                                        "0 12px 30px rgba(0,0,0,0.35)",
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        marginBottom:
                                            "12px",
                                    }}
                                >
                                    <strong>Trade Menu</strong>
                                    <button
                                        type="button"
                                        onClick={handleCloseTrade}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#1d4ed8";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#1f2937";
                                        }}
                                        style={{
                                            border: "none",
                                            background: "#1f2937",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "18px",
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "6px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#d1d5db",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <span>Give:</span>
                                </div>
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap: "8px",
                                    }}
                                >
                                    {tradeGiveOptions.map((resource) => (
                                        <button
                                            key={resource}
                                            type="button"
                                            onClick={() =>
                                                handleSelectGiveResource(resource)
                                            }
                                            style={{
                                                padding: "10px",
                                                borderRadius: "10px",
                                                border:
                                                    selectedGiveResource === resource
                                                        ? "2px solid #60a5fa"
                                                        : "1px solid #374151",
                                                background:
                                                    selectedGiveResource === resource
                                                        ? "#1d4ed8"
                                                        : "#1f2937",
                                                color: "white",
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                textAlign: "left",
                                            }}
                                        >
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                {renderResourceBadge(
                                                    resource,
                                                    getTradeRatio(
                                                        game,
                                                        currentPlayer!.id,
                                                        resource
                                                    )
                                                )}
                                                <span>{resource}</span>
                                            </span>
                                        </button>
                                    ))}
                                    {tradeGiveOptions.length ===
                                        0 && (
                                            <div
                                                style={{
                                                    color:
                                                        "#9ca3af",
                                                    fontSize:
                                                        "13px",
                                                }}
                                            >
                                                No valid
                                                4:1 trades
                                                available.
                                            </div>
                                        )}
                                </div>
                                {selectedGiveResource && (
                                    <>
                                        <div
                                            style={{
                                                fontSize:
                                                    "13px",
                                                color:
                                                    "#d1d5db",
                                                marginTop:
                                                    "16px",
                                                marginBottom:
                                                    "10px",
                                            }}
                                        >
                                            <span>Receive:</span>
                                        </div>
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap: "8px",
                                            }}
                                        >
                                            {tradeReceiveOptions.map(
                                                (
                                                    resource
                                                ) => (
                                                    <button
                                                        key={
                                                            resource
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectReceiveResource(
                                                                resource
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "10px",
                                                            borderRadius:
                                                                "10px",
                                                            border:
                                                                "1px solid #374151",
                                                            background:
                                                                "#1f2937",
                                                            color:
                                                                "white",
                                                            cursor:
                                                                "pointer",
                                                            fontWeight:
                                                                "bold",
                                                            textAlign:
                                                                "left",
                                                        }}
                                                    >
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                            {renderResourceBadge(resource, 1)}
                                                            <span>{resource}</span>
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                            {tradeReceiveOptions.length ===
                                                0 && (
                                                    <div
                                                        style={{
                                                            color:
                                                                "#9ca3af",
                                                            fontSize:
                                                                "13px",
                                                        }}
                                                    >
                                                        No
                                                        resources
                                                        available
                                                        from the
                                                        bank.
                                                    </div>
                                                )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    {game.phase === "playing" && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                right: "16px",
                                bottom: "16px",
                            }}
                        >
                            {renderActionBar({
                                diceOnly: true,
                            })}
                        </div>
                    )}
                </div>
            }
            rightSidebar={
                <>
                    <GameStatus
                        game={game}
                        onRestoreCheckpoint={
                            handleRestoreCheckpoint
                        }
                        canRestoreCheckpoint={
                            restoreAvailable
                        }
                    />
                    <GameLog game={game} />
                    <PlayerPanel game={game} />
                </>
            }
            bottom={renderActionBar({
                hideDice: true,
            })}
        />
    );
}
export default App;