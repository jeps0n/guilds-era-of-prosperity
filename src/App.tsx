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
import {
    buyDevelopmentCard
} from "./game/systems/developmentCards/buyDevelopmentCard";
const initialGame = createInitialState();
if (import.meta.env.DEV) {
    validateBoard(initialGame.board);
}
import { getTradeRatio } from "./game/systems/trading/getTradeRatio";
import RobberActionBar from "./components/RobberActionBar";
import {
    SecondaryMenu,
    SecondaryMenuButton,
} from "./components/SecondaryMenu";
function App() {
    const [game, setGame] = useState(initialGame);
    // const [tradeOpen, setTradeOpen] = useState(false);
    type SecondaryMenuMode =
        | "trade"
        | "development"
        | undefined;
    const [secondaryMenu, setSecondaryMenu] =
        useState<SecondaryMenuMode>(undefined);
    const [selectedGiveResource, setSelectedGiveResource] =
        useState<keyof Resources | undefined>(undefined);
    useEffect(() => {
        console.log("===== GAME STATE UPDATED [Turn: " + game.turnNumber + "] =====");
        console.log("Game:", game);
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
    function handleBuyDevelopmentCard() {
        const nextGame = buyDevelopmentCard(
            game,
            game.currentPlayerId
        );
        if (nextGame === game) {
            console.warn(
                "[Development Card] Purchase attempted but was rejected."
            );
            return;
        }
        console.log(
            "========== DEVELOPMENT CARD PURCHASED =========="
        );
        console.log(
            "Player:",
            game.currentPlayerId
        );
        console.log(
            "Purchased Card:",
            nextGame.players.find(
                (player) =>
                    player.id === game.currentPlayerId
            )?.developmentCards.at(-1)
        );
        console.log(
            "Remaining Development Deck:",
            nextGame.developmentDeck.length
        );
        console.log(
            "Player Resources:",
            nextGame.players.find(
                (player) =>
                    player.id === game.currentPlayerId
            )?.resources
        );
        console.log(
            "Player Development Cards:",
            nextGame.players.find(
                (player) =>
                    player.id === game.currentPlayerId
            )?.developmentCards
        );
        console.log(
            "Event Log:",
            nextGame.eventLog
        );
        console.log(
            "FULL GAME STATE:",
            nextGame
        );
        console.log(
            "==============================================="
        );
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
        setSecondaryMenu("trade");
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
        setSecondaryMenu(undefined);
        setSelectedGiveResource(undefined);
    }
    function handleRollDice() {
        const nextGame = rollDice(game);
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleSelectRobberTile(tileId: string) {
        const tile = game.board.tiles.find(
            (candidate) => candidate.id === tileId
        );
        if (!tile) {
            return;
        }
        const currentPlayer = game.players.find(
            (player) => player.id === game.currentPlayerId
        );
        if (!currentPlayer) {
            return;
        }
        /*
         * Find all board nodes touching the robber tile.
         */
        const adjacentNodes = game.board.nodes.filter(
            (node) => node.adjacentTiles.includes(tileId)
        );
        /*
         * Find opponents who have a settlement or city
         * adjacent to the robber tile.
         */
        const eligibleOpponents = game.players.filter(
            (player) => {
                if (player.id === currentPlayer.id) {
                    return false;
                }
                const hasBuildingAdjacent = adjacentNodes.some(
                    (node) => {
                        const hasSettlement =
                            player.settlements.some(
                                (settlement) =>
                                    settlement.nodeId === node.id
                            );
                        const hasCity =
                            player.cities.includes(node.id);
                        return hasSettlement || hasCity;
                    }
                );
                return hasBuildingAdjacent;
            }
        );
        /*
         * Choose one eligible opponent.
         */
        const opponent =
            eligibleOpponents.length > 0
                ? eligibleOpponents[
                Math.floor(
                    Math.random() *
                    eligibleOpponents.length
                )
                ]
                : undefined;
        /*
         * Find resources the opponent actually has.
         */
        const stealableResources = opponent
            ? (
                [
                    "brick",
                    "lumber",
                    "wheat",
                    "sheep",
                    "ore",
                ] as (keyof Resources)[]
            ).filter(
                (resource) =>
                    opponent.resources[resource] > 0
            )
            : [];
        /*
         * Randomly steal one resource if possible.
         */
        const stolenResource =
            stealableResources.length > 0
                ? stealableResources[
                Math.floor(
                    Math.random() *
                    stealableResources.length
                )
                ]
                : undefined;
        /*
         * Move the robber and resolve the optional steal.
         */
        const nextPlayers = game.players.map(
            (player) => {
                if (
                    stolenResource &&
                    opponent &&
                    player.id === opponent.id
                ) {
                    return {
                        ...player,
                        resources: {
                            ...player.resources,
                            [stolenResource]:
                                player.resources[stolenResource] - 1,
                        },
                    };
                }
                if (
                    stolenResource &&
                    player.id === currentPlayer.id
                ) {
                    return {
                        ...player,
                        resources: {
                            ...player.resources,
                            [stolenResource]:
                                player.resources[stolenResource] + 1,
                        },
                    };
                }
                return player;
            }
        );
        const robberMovedEvent = {
            id: `robber-moved-${Date.now()}`,
            type: "ROBBER_MOVED" as const,
            message: `${currentPlayer.name} moved the robber to (${tile.numberToken ?? "?"})[${tile.resource}]`,
            timestamp: Date.now(),
        };
        const stealEvent =
            stolenResource && opponent
                ? {
                    id: `resource-stolen-${Date.now()}`,
                    type: "RESOURCE_STOLEN" as const,
                    message: `${currentPlayer.name} stole [${stolenResource}] 1 from ${opponent.name}.`,
                    timestamp: Date.now(),
                }
                : undefined;
        const nextGame = {
            ...game,
            players: nextPlayers,
            robberTileId: tileId,
            robberPending: false,
            eventLog: [
                ...game.eventLog,
                robberMovedEvent,
                ...(stealEvent
                    ? [stealEvent]
                    : []),
            ],
        };
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
                placementAction={game.placementAction}
                lastDiceRoll={game.lastDiceRoll}
                availability={actionAvailability}
                onRollDice={handleRollDice}
                onEndTurn={handleEndTurn}
                onTrade={handleTrade}
                onBuyDevelopmentCard={handleBuyDevelopmentCard}
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
                        onSelectTile={
                            game.phase === "playing" && game.robberPending
                                ? handleSelectRobberTile
                                : undefined
                        }
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
                    {secondaryMenu === "trade" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Trade"
                            onClose={handleCloseTrade}
                        >
                            {tradeGiveOptions.length !== 0 && (
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#d1d5db",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <span>Give:</span>
                                </div>
                            )}
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
                                    <SecondaryMenuButton
                                        key={resource}
                                        active={selectedGiveResource === resource}
                                        onClick={() =>
                                            handleSelectGiveResource(resource)
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
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
                                    </SecondaryMenuButton>
                                ))}
                                {tradeGiveOptions.length === 0 && (
                                    <div
                                        style={{
                                            color: "#9ca3af",
                                            fontSize: "13px",
                                        }}
                                    >
                                        No valid trades available.
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
                                        Receive:
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
                                        {tradeReceiveOptions.map((resource) => (
                                            <SecondaryMenuButton
                                                key={resource}
                                                onClick={() =>
                                                    handleSelectReceiveResource(resource)
                                                }
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                    }}
                                                >
                                                    {renderResourceBadge(resource, 1)}
                                                    <span>{resource}</span>
                                                </span>
                                            </SecondaryMenuButton>
                                        ))}
                                        {tradeReceiveOptions.length === 0 && (
                                            <div
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                No resources available from the bank.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </SecondaryMenu>
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
            bottom={
                game.robberPending ? (
                    <RobberActionBar
                        playerColor={currentPlayerColor}
                    />
                ) : (
                    renderActionBar({
                        hideDice: true,
                    })
                )
            }
        />
    );
}
export default App;