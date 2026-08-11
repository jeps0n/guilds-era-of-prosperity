import { useState, useEffect } from "react";
import ActionBar from "./components/ActionBar";
import BoardView from "./components/BoardView";
import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import GameLayout from "./components/layout/GameLayout";
import GameLog from "./components/GameLog";
import PlayerPanel from "./components/PlayerPanel";
import RobberActionBar from "./components/RobberActionBar";
import { createInitialState } from "./game/engine/initialState";
import { validateBoard } from "./game/engine/boardValidation/validateBoard";
import { selectGuild } from "./game/systems/guildSelection";
import { placeSettlement } from "./game/systems/initialPlacement/placeSettlement";
import { placeRoad } from "./game/systems/initialPlacement/placeRoad";
import { endTurn } from "./game/systems/turn/endTurn";
import { rollDice } from "./game/systems/turn/rollDice";
import type { GuildType, Resources } from "./game/engine/types";
import { getActionAvailability } from "./game/systems/actions/getActionAvailability";
import { buildRoad } from "./game/systems/building/buildRoad";
import { buildSettlement } from "./game/systems/building/buildSettlement";
import { buildCity } from "./game/systems/building/buildCity";
import { tradeWithBank } from "./game/systems/trading/tradeWithBank";
import { buyDevelopmentCard } from "./game/systems/developmentCards/buyDevelopmentCard";
import { playDevelopmentCard } from "./game/systems/developmentCards/playDevelopmentCard";
import { resolveYearOfPlenty } from "./game/systems/developmentCards/resolveYearOfPlenty";
import type { DevelopmentCardType } from "./game/domain/DevelopmentCard";
import { getTradeRatio } from "./game/systems/trading/getTradeRatio";
import {
    SecondaryMenu,
    SecondaryMenuButton,
} from "./components/SecondaryMenu";
import {
    savePhaseCheckpoint,
    restorePhaseCheckpoint,
    canRestorePhaseCheckpoint,
} from "./store/gameStore";
const initialGame = createInitialState();
if (import.meta.env.DEV) {
    validateBoard(initialGame.board);
}
function App() {
    const [game, setGame] = useState(initialGame);
    type SecondaryMenuMode =
        | "trade"
        | "development"
        | undefined;
    const [secondaryMenu, setSecondaryMenu] =
        useState<SecondaryMenuMode>(undefined);
    const [selectedGiveResource, setSelectedGiveResource] =
        useState<keyof Resources | undefined>(undefined);
    /*
     * Year of Plenty selection tracks BOTH:
     * - the resource selected
     * - the unique slot/button that was clicked
     *
     * This is important because the 2 x 5 grid contains duplicate
     * resources. Tracking only the resource would cause both duplicate
     * buttons to highlight.
     */
    const [yearOfPlentySelection, setYearOfPlentySelection] =
        useState<{
            resource: keyof Resources;
            slot: number;
        } | undefined>(undefined);
    useEffect(() => {
        console.log(
            "===== GAME STATE UPDATED [Turn: " +
            game.turnNumber +
            "] ====="
        );
        console.log("Game: ", game);
        console.log("Deck: ", game.developmentDeck);
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
    function getDevelopmentCardName(
        type: DevelopmentCardType
    ) {
        switch (type) {
            case "knight":
                return "Knight";
            case "road_building":
                return "Road Building";
            case "year_of_plenty":
                return "Year of Plenty";
            case "monopoly":
                return "Monopoly";
            case "victory_point":
                return "Victory Point";
            default:
                return type;
        }
    }
    function handleBuyDevelopmentCard() {
        const nextGame = buyDevelopmentCard(
            game,
            game.currentPlayerId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    // ABC - OPEN DEV CARD MENU
    function handlePlayDevelopmentCard() {
        setSecondaryMenu("development");
    }
    function handleSelectDevelopmentCard(cardId: string) {
        console.log(
            "handleSelectDevelopmentCard -[cardId]: ",
            cardId
        );
        const nextGame = playDevelopmentCard(
            game,
            game.currentPlayerId,
            cardId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setSecondaryMenu(undefined);
    }
    // ABC - OPEN TRADE MENU
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
        executeTrade(
            selectedGiveResource,
            resource
        );
        handleCloseTrade();
    }
    function executeTrade(
        giveResource: keyof Resources,
        receiveResource: keyof Resources
    ) {
        const nextGame = tradeWithBank(
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
    /*
     * YEAR OF PLENTY
     *
     * Each button has a unique slot.
     * The first click stores both the resource and slot.
     */
    function handleSelectYearOfPlentyResource(
        resource: keyof Resources,
        slot: number
    ) {
        if (yearOfPlentySelection === undefined) {
            setYearOfPlentySelection({
                resource,
                slot,
            });
            return;
        }
        executeYearOfPlenty(
            yearOfPlentySelection.resource,
            resource
        );
    }
    /*
     * Close Year of Plenty without completing it.
     *
     * Clear the local selection and close the menu so the player
     * can start the selection process over.
     */
    function handleCloseYearOfPlenty() {
        setYearOfPlentySelection(undefined);
        setSecondaryMenu(undefined);
        setGame((currentGame) => ({
            ...currentGame,
            yearOfPlentyPending: false,
            yearOfPlentyCardId: undefined,
            yearOfPlentyFirstResource: undefined,
        }));
    }
    function executeYearOfPlenty(
        firstResource: keyof Resources,
        secondResource: keyof Resources
    ) {
        const nextGame = resolveYearOfPlenty(
            game,
            game.currentPlayerId,
            firstResource,
            secondResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setYearOfPlentySelection(undefined);
        setSecondaryMenu(undefined);
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
            (player) =>
                player.id === game.currentPlayerId
        );
        if (!currentPlayer) {
            return;
        }
        /*
         * Find all board nodes touching the robber tile.
         */
        const adjacentNodes = game.board.nodes.filter(
            (node) =>
                node.adjacentTiles.includes(tileId)
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
                const hasBuildingAdjacent =
                    adjacentNodes.some(
                        (node) => {
                            const hasSettlement =
                                player.settlements.some(
                                    (settlement) =>
                                        settlement.nodeId ===
                                        node.id
                                );
                            const hasCity =
                                player.cities.includes(
                                    node.id
                                );
                            return (
                                hasSettlement ||
                                hasCity
                            );
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
                                player.resources[
                                stolenResource
                                ] - 1,
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
                                player.resources[
                                stolenResource
                                ] + 1,
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
        console.log("===== END TURN CLICKED =====");
        console.log("BEFORE END TURN:", {
            yearOfPlentyPending: game.yearOfPlentyPending,
            yearOfPlentyCardId: game.yearOfPlentyCardId,
            yearOfPlentySelection,
            secondaryMenu,
        });
        handleCloseTrade();
        handleCloseYearOfPlenty();
        const nextGame = endTurn(game);
        console.log("AFTER endTurn():", {
            yearOfPlentyPending: nextGame.yearOfPlentyPending,
            yearOfPlentyCardId: nextGame.yearOfPlentyCardId,
            yearOfPlentyFirstResource: nextGame.yearOfPlentyFirstResource,
        });
        if (nextGame === game) {
            console.log("END TURN REJECTED");
            return;
        }
        setGame(nextGame);
        savePhaseCheckpoint(nextGame);
        console.log("===== END TURN COMPLETE =====");
    }
    function handleRestoreCheckpoint() {
        const restoredGame =
            restorePhaseCheckpoint(game);
        if (!restoredGame) {
            return;
        }
        handleCloseTrade();
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
                    backgroundColor:
                        resourceColors[resource],
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
            ? tradeResources.filter(
                (resource) => {
                    const ratio =
                        getTradeRatio(
                            game,
                            currentPlayer.id,
                            resource
                        );
                    return (
                        currentPlayer.resources[
                        resource
                        ] >= ratio
                    );
                }
            )
            : [];
    const tradeReceiveOptions =
        selectedGiveResource
            ? tradeResources.filter(
                (resource) =>
                    resource !==
                    selectedGiveResource &&
                    game.resourceBank[resource] >=
                    1
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
                playerColor={
                    currentPlayerColor
                }
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
                onBuyDevelopmentCard={
                    handleBuyDevelopmentCard
                }
                onPlayDevelopmentCard={
                    handlePlayDevelopmentCard
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
                        robberPending={
                            game.robberPending
                        }
                        robberTileId={
                            game.robberTileId
                        }
                        onSelectTile={
                            game.phase ===
                                "playing" &&
                                game.robberPending
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
                                                (
                                                    settlement
                                                ) =>
                                                    settlement.nodeId ===
                                                    nodeId
                                            );
                                        if (
                                            ownsSettlement
                                        ) {
                                            handleBuildCity(
                                                nodeId
                                            );
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
                    {/* SECONDARY MENU: TRADE */}
                    {secondaryMenu ===
                        "trade" &&
                        game.phase ===
                        "playing" && (
                            <SecondaryMenu
                                title="Trade"
                                onClose={
                                    handleCloseTrade
                                }
                            >
                                {tradeGiveOptions.length !==
                                    0 && (
                                        <div
                                            style={{
                                                fontSize:
                                                    "13px",
                                                color:
                                                    "#d1d5db",
                                                marginBottom:
                                                    "10px",
                                            }}
                                        >
                                            <span>
                                                Give:
                                            </span>
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
                                    {tradeGiveOptions.map(
                                        (
                                            resource
                                        ) => (
                                            <SecondaryMenuButton
                                                key={
                                                    resource
                                                }
                                                active={
                                                    selectedGiveResource ===
                                                    resource
                                                }
                                                onClick={() =>
                                                    handleSelectGiveResource(
                                                        resource
                                                    )
                                                }
                                            >
                                                <span
                                                    style={{
                                                        display:
                                                            "inline-flex",
                                                        alignItems:
                                                            "center",
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
                                                    <span>
                                                        {
                                                            resource
                                                        }
                                                    </span>
                                                </span>
                                            </SecondaryMenuButton>
                                        )
                                    )}
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
                                                No valid trades
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
                                            {tradeReceiveOptions.map(
                                                (
                                                    resource
                                                ) => (
                                                    <SecondaryMenuButton
                                                        key={
                                                            resource
                                                        }
                                                        onClick={() =>
                                                            handleSelectReceiveResource(
                                                                resource
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "8px",
                                                            }}
                                                        >
                                                            {renderResourceBadge(
                                                                resource,
                                                                1
                                                            )}
                                                            <span>
                                                                {
                                                                    resource
                                                                }
                                                            </span>
                                                        </span>
                                                    </SecondaryMenuButton>
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
                                                        No resources
                                                        available
                                                        from the
                                                        bank.
                                                    </div>
                                                )}
                                        </div>
                                    </>
                                )}
                            </SecondaryMenu>
                        )}
                    {/* SECONDARY MENU: DEV CARD */}
                    {secondaryMenu ===
                        "development" &&
                        game.phase ===
                        "playing" && (
                            <SecondaryMenu
                                title="Play Development Card"
                                onClose={() =>
                                    setSecondaryMenu(
                                        undefined
                                    )
                                }
                            >
                                {!currentPlayer ||
                                    currentPlayer
                                        .developmentCards
                                        .length ===
                                    0 ? (
                                    <div
                                        style={{
                                            color:
                                                "#9ca3af",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        You have no
                                        development
                                        cards to play.
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {currentPlayer.developmentCards.map(
                                            (
                                                card
                                            ) => {
                                                const isPlayed =
                                                    currentPlayer.playedDevelopmentCardIds.includes(
                                                        card.id
                                                    );
                                                const isPurchasedThisTurn =
                                                    currentPlayer.developmentCardsPurchasedThisTurn.includes(
                                                        card.id
                                                    );
                                                const isVictoryPoint =
                                                    card.type ===
                                                    "victory_point";
                                                const isPlayable =
                                                    card.type !==
                                                    "victory_point" &&
                                                    !isPlayed &&
                                                    !isPurchasedThisTurn &&
                                                    !currentPlayer.developmentCardPlayedThisTurn;
                                                return (
                                                    <SecondaryMenuButton
                                                        key={
                                                            card.id
                                                        }
                                                        disabled={
                                                            !isPlayable
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !isPlayable
                                                            ) {
                                                                return;
                                                            }
                                                            handleSelectDevelopmentCard(
                                                                card.id
                                                            );
                                                        }}
                                                    >
                                                        {getDevelopmentCardName(
                                                            card.type
                                                        )}
                                                        {isVictoryPoint &&
                                                            " (+1 VP)"}
                                                    </SecondaryMenuButton>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </SecondaryMenu>
                        )}
                    {/* SECONDARY MENU: YEAR OF PLENTY */}
                    {game.phase ===
                        "playing" &&
                        game.yearOfPlentyPending &&
                        secondaryMenu !==
                        "development" &&
                        secondaryMenu !==
                        "trade" && (
                            <SecondaryMenu
                                title="Year of Plenty"
                                onClose={
                                    handleCloseYearOfPlenty
                                }
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "13px",
                                        color:
                                            "#d1d5db",
                                        marginBottom:
                                            "12px",
                                    }}
                                >
                                    {yearOfPlentySelection ===
                                        undefined
                                        ? "Select your first resource:"
                                        : "Select your second resource:"}
                                </div>
                                {/*
                                 * 2 x 5 grid.
                                 *
                                 * There are exactly 10 unique button
                                 * instances:
                                 *
                                 * brick  | brick
                                 * lumber | lumber
                                 * wheat  | wheat
                                 * sheep  | sheep
                                 * ore    | ore
                                 *
                                 * The slot number makes each button
                                 * independently selectable/highlightable.
                                 */}
                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr",
                                        gap: "8px",
                                    }}
                                >
                                    {tradeResources.flatMap(
                                        (
                                            resource
                                        ) =>
                                            [0, 1].map(
                                                (
                                                    slot
                                                ) => {
                                                    const isFirstSelection =
                                                        yearOfPlentySelection?.resource ===
                                                        resource &&
                                                        yearOfPlentySelection?.slot ===
                                                        slot;
                                                    return (
                                                        <SecondaryMenuButton
                                                            key={`${resource}-${slot}`}
                                                            active={
                                                                isFirstSelection
                                                            }
                                                            onClick={() =>
                                                                handleSelectYearOfPlentyResource(
                                                                    resource,
                                                                    slot
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "8px",
                                                                    width: "100%",
                                                                    justifyContent:
                                                                        "flex-start",
                                                                }}
                                                            >
                                                                {renderResourceBadge(
                                                                    resource,
                                                                    1
                                                                )}
                                                                <span>
                                                                    {
                                                                        resource
                                                                    }
                                                                </span>
                                                            </span>
                                                        </SecondaryMenuButton>
                                                    );
                                                }
                                            )
                                    )}
                                </div>
                            </SecondaryMenu>
                        )}
                    {game.phase ===
                        "playing" && (
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
                        playerColor={
                            currentPlayerColor
                        }
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