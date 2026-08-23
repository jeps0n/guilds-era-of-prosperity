import { useState, useEffect, useRef } from "react";
import ActionBar from "./components/ActionBar";
import BoardView from "./components/BoardView";
import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import GameLayout from "./components/layout/GameLayout";
import GameLog from "./components/GameLog";
import PlayerPanel from "./components/PlayerPanel";
import RobberActionBar from "./components/RobberActionBar";
import GuildInformationPanel from "./components/GuildInformationPanel";
import SuperMenu from "./components/SuperMenu";
import { SecondaryMenu, SecondaryMenuButton, } from "./components/SecondaryMenu";
import type { GuildType, Resources } from "./game/engine/types";
import type { DevelopmentCardType } from "./game/domain/DevelopmentCard";
import { createInitialState } from "./game/engine/initialState";
import { validateBoard } from "./game/engine/boardValidation/validateBoard";
import { selectGuild } from "./game/systems/guildSelection";
import { placeSettlement } from "./game/systems/initialPlacement/placeSettlement";
import { placeRoad } from "./game/systems/initialPlacement/placeRoad";
import { endTurn } from "./game/systems/turn/endTurn";
import { rollDice } from "./game/systems/turn/rollDice";
import { getActionAvailability } from "./game/systems/actions/getActionAvailability";
import { buildRoad } from "./game/systems/building/buildRoad";
import { buildSettlement } from "./game/systems/building/buildSettlement";
import { buildCity } from "./game/systems/building/buildCity";
import { tradeWithBank } from "./game/systems/trading/tradeWithBank";
import { getTradeRatio } from "./game/systems/trading/getTradeRatio";
import { getEffectiveTradeRatio } from "./game/guilds/merchant/passive/getEffectiveTradeRatio";
import { buyDevelopmentCard } from "./game/systems/developmentCards/buyDevelopmentCard";
import { playDevelopmentCard } from "./game/systems/developmentCards/playDevelopmentCard";
import { resolveYearOfPlenty } from "./game/systems/developmentCards/resolveYearOfPlenty";
import { resolveMonopoly } from "./game/systems/developmentCards/resolveMonopoly";
import { calculateLongestRoad } from "./game/systems/achievements/calculateLongestRoad";
import { rollSecondaryDice, } from "./game/guilds/prosperity/rollSecondaryDice";
import { SuperOrchestrator } from "./game/guilds/SuperOrchestrator";
import { superOrchestrator } from "./components/SuperMenu";
import {
    savePhaseCheckpoint,
    restorePhaseCheckpoint,
    canRestorePhaseCheckpoint,
} from "./store/gameStore";
import {
    canOpenGuildDiscountMenu,
} from "./game/systems/actions/canOpenGuildDiscountMenu";
const initialGame = createInitialState();
if (import.meta.env.DEV) {
    validateBoard(initialGame.board);
}
function App() {
    const [game, setGame] = useState(initialGame);
    type SecondaryMenuMode =
        | "trade"
        | "development"
        | "merchantDevelopment"
        | "explorerRoad"
        | "builderSettlement"
        | "builderCity"
        | undefined;
    const [secondaryMenu, setSecondaryMenu] =
        useState<SecondaryMenuMode>(undefined);
    const developmentCardListRef =
        useRef<HTMLDivElement>(null);
    const [selectedGiveResource, setSelectedGiveResource] =
        useState<keyof Resources | undefined>(undefined);
    const [merchantKeepResource, setMerchantKeepResource] =
        useState<keyof Resources | undefined>(undefined);
    const [explorerRoadEdgeId, setExplorerRoadEdgeId] =
        useState<string | undefined>(undefined);
    const [explorerKeepResource, setExplorerKeepResource] =
        useState<"brick" | "lumber" | undefined>(undefined);
    const [builderSettlementNodeId, setBuilderSettlementNodeId] =
        useState<string | undefined>(undefined);
    const [builderSettlementResource, setBuilderSettlementResource] =
        useState<keyof Resources | undefined>(undefined);
    const [builderCityNodeId, setBuilderCityNodeId] =
        useState<string | undefined>(undefined);
    const [builderCityResource, setBuilderCityResource] =
        useState<"ore" | "wheat" | undefined>(undefined);
    const [prosperityRollSequenceActive, setProsperityRollSequenceActive] =
        useState(false);
    const [secondaryRollRevealing, setSecondaryRollRevealing] =
        useState(false);
    const [superUnlockRevealing, setSuperUnlockRevealing] =
        useState(false);
    const [superUnlockPlayerName, setSuperUnlockPlayerName] =
        useState<string | undefined>(undefined);
    const [showSuperMenu, setShowSuperMenu] =
        useState(false);
    const [superPending, setSuperPending] =
        useState<GuildType | undefined>(undefined);
    const prosperityRollTimeoutRef =
        useRef<number | null>(null);
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
    // FOR DEBUGGING - DELETE useEffect EVENTUALLY
    useEffect(() => {
        console.log("=================== / GAME / ===================");
        console.log(game);
        console.log("===== " + currentPlayer?.id + " : " + currentPlayer?.name + " ===== [Turn: " + game.turnNumber + "] =====");
        console.log(currentPlayer);
        console.log("----------------------------------------");
        function handleKeyDown(event: KeyboardEvent) {
            const key = event.key.toLowerCase();
            if (key === "t") {
                handleRestoreCheckpoint();
                return;
            }
            if (key === "r") {
                handleRollDice();
                return;
            }
            if (key === "e") {
                handleEndTurn();
                return;
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [game]);
    useEffect(() => {
        console.log("----------------------------------------");
        console.log("superPending UPDATED:", superPending);
        console.log("----------------------------------------");
    }, [superPending]);
    function getCurrentPlayer() {
        return game.players.find(
            (player) =>
                player.id === game.currentPlayerId
        );
    }
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
        // Get the current player before checking player-specific rules.
        const player = getCurrentPlayer();
        // Stop if there is no current player.
        if (!player) {
            return;
        }
        // Grand Expedition uses free roads and skips normal guild logic.
        if (game.grandExpeditionPending) {
            // Let the engine handle the free road placement.
            const nextGame = buildRoad(
                game,
                game.currentPlayerId,
                edgeId
            );
            // Stop if the engine rejected the placement.
            if (nextGame === game) {
                return;
            }
            // Save the successful road placement.
            setGame(nextGame);
            return;
        }
        // Normal roads must first pass the guild target check.
        if (
            !canOpenGuildDiscountMenu(
                game,
                "road",
                edgeId
            )
        ) {
            return;
        }
        // Check whether this player is an Explorer
        // who still has their passive available this turn.
        const isExplorer =
            player.guild === "explorer";
        const explorerPassiveAvailable =
            isExplorer &&
            !player.guildPassiveUsedThisTurn;
        // Check whether the player has both resources needed for a normal road.
        const hasBrick =
            player.resources.brick >= 1;
        const hasLumber =
            player.resources.lumber >= 1;
        // An available Explorer with both resources must choose
        // which resource to keep before building the discounted road.
        if (
            explorerPassiveAvailable &&
            hasBrick &&
            hasLumber
        ) {
            // Save the selected edge and open the Explorer resource choice.
            setExplorerRoadEdgeId(edgeId);
            setExplorerKeepResource(undefined);
            setSecondaryMenu("explorerRoad");
            return;
        }
        // Let the engine resolve the normal road placement.
        // This handles both the Explorer discount and normal road cost.
        const nextGame = buildRoad(
            game,
            game.currentPlayerId,
            edgeId
        );
        // Stop if the engine rejected the placement.
        if (nextGame === game) {
            return;
        }
        // Save the successful road placement.
        setGame(nextGame);
    }
    function handleBuildSettlement(
        nodeId: string
    ) {
        // The target must be valid before opening the guild flow.
        if (
            !canOpenGuildDiscountMenu(
                game,
                "settlement",
                nodeId
            )
        ) {
            return;
        }
        // Get the current player.
        const player = getCurrentPlayer();
        if (!player) {
            return;
        }
        // Check whether the Builder discount is still available.
        const isBuilder =
            player.guild === "builder";
        const builderPassiveAvailable =
            isBuilder &&
            !player.guildPassiveUsedThisTurn;
        // Resources required for a normal settlement.
        const settlementResources = [
            "brick",
            "lumber",
            "wheat",
            "sheep",
        ] as const;
        // Builder can remove one missing resource from the cost.
        if (builderPassiveAvailable) {
            const missingResources = settlementResources.filter(
                (resource) => player.resources[resource] < 1
            );
            // One resource is missing, so the discount is automatic.
            if (missingResources.length === 1) {
                const nextGame = buildSettlement(
                    game,
                    game.currentPlayerId,
                    nodeId,
                    missingResources[0]
                );
                if (nextGame === game) {
                    return;
                }
                setGame(nextGame);
                return;
            }
            // All resources are available, so let the player choose.
            if (missingResources.length === 0) {
                setBuilderSettlementNodeId(nodeId);
                setBuilderSettlementResource(undefined);
                setSecondaryMenu("builderSettlement");
                return;
            }
            // Two or more resources are missing, so the settlement
            // cannot be built with the one-resource discount.
            return;
        }
        // Use the normal settlement cost.
        const nextGame = buildSettlement(
            game,
            game.currentPlayerId,
            nodeId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleBuildCity(nodeId: string) {
        // The target must be valid before opening the guild flow.
        if (
            !canOpenGuildDiscountMenu(
                game,
                "city",
                nodeId
            )
        ) {
            return;
        }
        // Get the current player.
        const player = getCurrentPlayer();
        if (!player) {
            return;
        }
        // Check whether the Builder discount is still available.
        const isBuilder =
            player.guild === "builder";
        const builderPassiveAvailable =
            isBuilder &&
            !player.guildPassiveUsedThisTurn;
        // Check which discounted city costs the Builder can afford.
        if (builderPassiveAvailable) {
            const hasOreDiscountOnly =
                player.resources.ore >= 2 &&
                player.resources.ore < 3 &&
                player.resources.wheat >= 2;
            const hasWheatDiscountOnly =
                player.resources.ore >= 3 &&
                player.resources.wheat >= 1 &&
                player.resources.wheat < 2;
            const hasFullCityCost =
                player.resources.ore >= 3 &&
                player.resources.wheat >= 2;
            // Missing one ore, so the ore discount is automatic.
            if (hasOreDiscountOnly) {
                const nextGame = buildCity(
                    game,
                    game.currentPlayerId,
                    nodeId,
                    "ore"
                );
                if (nextGame === game) {
                    return;
                }
                setGame(nextGame);
                return;
            }
            // Missing one wheat, so the wheat discount is automatic.
            if (hasWheatDiscountOnly) {
                const nextGame = buildCity(
                    game,
                    game.currentPlayerId,
                    nodeId,
                    "wheat"
                );
                if (nextGame === game) {
                    return;
                }
                setGame(nextGame);
                return;
            }
            // All resources are available, so let the player choose.
            if (hasFullCityCost) {
                setBuilderCityNodeId(nodeId);
                setBuilderCityResource(undefined);
                setSecondaryMenu("builderCity");
                return;
            }
        }
        // Use the normal city cost.
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
    // BUILDER DISCOUNT
    function handleBuilderSettlement(
        discountedResource: keyof Resources
    ) {
        if (!builderSettlementNodeId) {
            return;
        }
        const nextGame = buildSettlement(
            game,
            game.currentPlayerId,
            builderSettlementNodeId,
            discountedResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setBuilderSettlementNodeId(undefined);
        setBuilderSettlementResource(undefined);
        setSecondaryMenu(undefined);
    }
    function handleBuilderCity(
        discountedResource: "ore" | "wheat"
    ) {
        if (!builderCityNodeId) {
            return;
        }
        const nextGame = buildCity(
            game,
            game.currentPlayerId,
            builderCityNodeId,
            discountedResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setBuilderCityNodeId(undefined);
        setBuilderCityResource(undefined);
        setSecondaryMenu(undefined);
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
        const player = getCurrentPlayer();
        if (!player) {
            return;
        }
        const isMerchant =
            player.guild === "merchant";
        const merchantPassiveAvailable =
            isMerchant && !player.guildPassiveUsedThisTurn;
        const requiredResources: (keyof Resources)[] = [
            "ore",
            "wheat",
            "sheep",
        ];
        const availableRequiredResources =
            requiredResources.filter(
                (resource) =>
                    player.resources[resource] >= 1
            );
        /*
         * Merchant with all three resources:
         * open the discount menu and let the player
         * choose which resource to keep.
         */
        if (
            merchantPassiveAvailable &&
            availableRequiredResources.length === 3
        ) {
            setMerchantKeepResource(undefined);
            setSecondaryMenu("merchantDevelopment");
            return;
        }
        /*
         * Merchant with exactly two resources:
         * purchase immediately at the discounted cost.
         */
        const nextGame = buyDevelopmentCard(
            game,
            game.currentPlayerId
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleMerchantDevelopmentPurchase(
        keepResource: keyof Resources
    ) {
        const nextGame = buyDevelopmentCard(
            game,
            game.currentPlayerId,
            keepResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setMerchantKeepResource(undefined);
        setSecondaryMenu(undefined);
    }
    function handleExplorerRoadBuild(
        keepResource: "brick" | "lumber"
    ) {
        if (!explorerRoadEdgeId) {
            return;
        }
        const nextGame = buildRoad(
            game,
            game.currentPlayerId,
            explorerRoadEdgeId,
            keepResource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
        setExplorerRoadEdgeId(undefined);
        setExplorerKeepResource(undefined);
        setSecondaryMenu(undefined);
    }
    // ABC - OPEN DEV CARD MENU
    function handlePlayDevelopmentCard() {
        setSecondaryMenu("development");
    }
    function handleSelectDevelopmentCard(cardId: string) {
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
        const player = getCurrentPlayer();
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
    function handleCloseMonopoly() {
        setSecondaryMenu(undefined);
        setGame((currentGame) => ({
            ...currentGame,
            monopolyPending: false,
            monopolyCardId: undefined,
            monopolyResource: undefined,
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
    function executeMonopoly(
        resource: keyof Resources
    ) {
        const nextGame = resolveMonopoly(
            game,
            game.currentPlayerId,
            resource
        );
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
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
        const currentPlayer = getCurrentPlayer();
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
                                        settlement.nodeId === node.id
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
            message: `${currentPlayer.name} moved the robber to (${tile.numberToken ?? "?"}) [${tile.resource}]`,
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
    function closeAllMenus() {
        setSecondaryMenu(undefined);
        handleCloseTrade();
        handleCloseYearOfPlenty();
        handleCloseMonopoly();
    }
    function handleEndTurn() {
        /*
         * Don't allow a manual End Turn to interrupt
         * the secondary-roll reveal.
         */
        if (secondaryRollRevealing || game.robberPending || game.roadBuildingPending) {
            return;
        }
        // Cancel any unfinished secondary action first.
        const gameBeforeEndTurn = {
            ...game,
            monopolyPending: false,
            monopolyCardId: undefined,
            monopolyResource: undefined,
            yearOfPlentyPending: false,
            yearOfPlentyCardId: undefined,
            yearOfPlentyFirstResource: undefined,
            roadBuildingPending: false,
            roadBuildingCardId: undefined,
            roadBuildingRoadsPlaced: 0,
        };
        // Close all secondary menus & super menu
        closeAllMenus();
        superOrchestrator.resetSelections();
        handleCancelSuper();
        // Begin or complete the turn-ending process.
        const nextGame = endTurn(gameBeforeEndTurn);
        if (nextGame === gameBeforeEndTurn) {
            return;
        }
        /*
         * If Prosperity just entered its secondary-roll phase,
         * lock the action bar for the whole sequence.
         */
        if (
            gameBeforeEndTurn.era === "prosperity" &&
            nextGame.secondaryRollPending
        ) {
            setProsperityRollSequenceActive(true);
        }
        setGame(nextGame);
        savePhaseCheckpoint(nextGame);
    }
    function handleRollSecondaryDice() {
        const rolledGame = rollSecondaryDice(game);
        if (rolledGame === game) {
            return;
        }
        setSecondaryRollRevealing(true);
        setGame(rolledGame);
        const previousPlayer = getCurrentPlayer();
        const rolledPlayer = rolledGame.players.find(
            (player) =>
                player.id === rolledGame.currentPlayerId
        );
        const justUnlocked =
            !previousPlayer?.superUnlocked &&
            rolledPlayer?.superUnlocked === true;
        if (justUnlocked) {
            setSuperUnlockPlayerName(
                rolledPlayer?.name
            );
        }
        prosperityRollTimeoutRef.current =
            window.setTimeout(() => {
                prosperityRollTimeoutRef.current = null;
                /*
                 * Sixth unique number:
                        /*
                         * Sixth unique number:
                         *
                         * Show the Super Unlock announcement
                         * instead of immediately ending the turn.
                         */
                if (justUnlocked) {
                    setSecondaryRollRevealing(false);
                    setSuperUnlockRevealing(true);
                    console.log("setSuperUnlockRevealing(true);");
                    prosperityRollTimeoutRef.current =
                        window.setTimeout(() => {
                            prosperityRollTimeoutRef.current = null;
                            setSuperUnlockRevealing(false);
                            console.log("setSuperUnlockRevealing(false);");
                            setGame((currentGame) => {
                                const readyToEnd = {
                                    ...currentGame,
                                    secondaryRollPending: false,
                                };
                                const nextGame = endTurn(readyToEnd);
                                if (nextGame === readyToEnd) {
                                    return currentGame;
                                }
                                // The turn has successfully advanced.
                                // Re-enable the ActionBar.
                                setProsperityRollSequenceActive(false);
                                savePhaseCheckpoint(nextGame);
                                return nextGame;
                            });
                        }, 4200);
                    return;
                }
                /*
                 * Normal secondary roll:
                 * finish the turn after the reveal.
                 */
                setGame((currentGame) => {
                    const readyToEnd = {
                        ...currentGame,
                        secondaryRollPending: false,
                    };
                    const nextGame = endTurn(readyToEnd);
                    if (nextGame === readyToEnd) {
                        return currentGame;
                    }
                    // The turn has successfully advanced.
                    // Re-enable the ActionBar.
                    setProsperityRollSequenceActive(false);
                    savePhaseCheckpoint(nextGame);
                    return nextGame;
                });
                setSecondaryRollRevealing(false);
            }, 1800);
    }
    function handleUseSuper() {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer) {
            return;
        }
        if (prosperityRollSequenceActive) {
            return;
        }
        if (!currentPlayer.superUnlocked) {
            return;
        }
        closeAllMenus();
        setSuperPending(currentPlayer.guild);
        setShowSuperMenu(true);
    }
    function handleCancelSuper() {
        setShowSuperMenu(false);
        setSuperPending(undefined);
    }
    function handleRestoreCheckpoint() {
        /*
        * Cancel any pending Prosperity Roll timer.
        * This prevents an old secondary-roll sequence
        * from modifying the restored checkpoint.
        */
        if (prosperityRollTimeoutRef.current !== null) {
            window.clearTimeout(
                prosperityRollTimeoutRef.current
            );
            prosperityRollTimeoutRef.current = null;
        }
        const restoredGame =
            restorePhaseCheckpoint(game);
        if (!restoredGame) {
            return;
        }
        // Close any open secondary menus & super menu
        closeAllMenus();
        superOrchestrator.resetSelections();
        handleCancelSuper();
        /*
         * Clear any Prosperity animation/announcement UI
         * that may have been active when Turn Back was clicked.
         */
        setSecondaryRollRevealing(false);
        setSuperUnlockRevealing(false);
        console.log("setSuperUnlockRevealing(false);");
        setSuperUnlockPlayerName(undefined);
        setProsperityRollSequenceActive(
            restoredGame.era === "prosperity" &&
            restoredGame.secondaryRollPending
        );
        setGame(restoredGame);
    }
    const currentPlayer = getCurrentPlayer();
    useEffect(() => {
        if (secondaryMenu === "development") {
            developmentCardListRef.current?.scrollTo({
                top: developmentCardListRef.current.scrollHeight,
                behavior: "auto",
            });
        }
    }, [
        secondaryMenu,
        currentPlayer?.developmentCards.length,
    ]);
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
    if (import.meta.env.DEV && game.phase === "playing") {
        calculateLongestRoad(
            game,
            game.currentPlayerId
        );
    }
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
            ? tradeResources.filter(
                (resource) => {
                    const ratio =
                        currentPlayer.guild === "merchant"
                            ? getEffectiveTradeRatio(
                                game,
                                currentPlayer.id,
                                resource
                            )
                            : getTradeRatio(
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
    const superTitle = superPending
        ? SuperOrchestrator.getSuperTitle(superPending)
        : "SUPER";
    function renderActionBar(
        options: {
            diceOnly?: boolean;
            hideDice?: boolean;
        } = {}
    ) {
        return (
            <ActionBar
                prosperityRollSequenceActive={
                    prosperityRollSequenceActive
                }
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
                roadBuildingPending={
                    game.roadBuildingPending
                }
                hasPlayableKnight={
                    actionAvailability.hasPlayableKnight
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
                // header="Guilds: Era of Prosperity"
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
            // header="Guilds: Era of Prosperity"
            board={
                <div
                    style={{
                        position: "relative",
                        width: "800px",
                        height: "600px",
                    }}
                >
                    <BoardView
                        era={game.era}
                        onRollSecondaryDice={
                            handleRollSecondaryDice
                        }
                        secondaryRollPending={
                            game.secondaryRollPending
                        }
                        secondaryRoll={
                            game.secondaryRoll
                        }
                        secondaryRolls={
                            getCurrentPlayer()?.secondaryRolls ?? []
                        }
                        superUnlocked={
                            getCurrentPlayer()?.superUnlocked ?? false
                        }
                        secondaryRollRevealing={
                            secondaryRollRevealing
                        }
                        superUnlockRevealing={
                            superUnlockRevealing
                        }
                        superUnlockPlayerName={
                            superUnlockPlayerName
                        }
                        superUnlockPlayerColor={
                            currentPlayerColor
                        }
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
                            game.phase === "playing" &&
                                game.robberPending
                                ? handleSelectRobberTile
                                : undefined
                        }
                        onSelectNode={
                            game.phase === "initial_placement" &&
                                game.placementAction === "settlement"
                                ? handlePlaceSettlement
                                : game.phase === "playing" && !game.robberPending
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
                                        handleBuildSettlement(nodeId);
                                    }
                                    : undefined
                        }
                        onSelectEdge={
                            game.phase === "initial_placement" && game.placementAction === "road"
                                ? handlePlaceRoad
                                : game.phase === "playing" && !game.robberPending &&
                                    (
                                        game.roadBuildingPending ||
                                        game.grandExpeditionPending ||
                                        actionAvailability.canRoad
                                    )
                                    ? handleBuildRoad
                                    : undefined
                        }
                        playerColor={
                            currentPlayerColor
                        }
                    />
                    <SuperMenu
                        visible={showSuperMenu}
                        title={superTitle}
                        onCancel={handleCancelSuper}
                        onConfirm={(nextGame) => {
                            setGame(nextGame);
                            setShowSuperMenu(false);
                        }}
                        game={game}
                    />
                    {/* SECONDARY MENU > RENDER TRADE OPTIONS */}
                    {secondaryMenu === "trade" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Trade"
                            onClose={
                                handleCloseTrade
                            }
                        >
                            {tradeGiveOptions.length !== 0 && (
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#d1d5db",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <span>
                                        Give:
                                    </span>
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {tradeGiveOptions.map(
                                    (
                                        resource
                                    ) => (
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
                                                    currentPlayer!.guild === "merchant"
                                                        ? getEffectiveTradeRatio(
                                                            game,
                                                            currentPlayer!.id,
                                                            resource
                                                        )
                                                        : getTradeRatio(
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
                            {selectedGiveResource && tradeGiveOptions.length > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#d1d5db",
                                            marginTop: "16px",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        Receive:
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
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
                                                    <span>
                                                        {resource}
                                                    </span>
                                                </span>
                                            </SecondaryMenuButton>
                                        )
                                        )}
                                        {tradeReceiveOptions.length === 0 && (
                                            <div
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: "13px",
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
                    {/* SECONDARY MENU > EXPLORER ROAD DISCOUNT */}
                    {secondaryMenu === "explorerRoad" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Explorer Discount"
                            onClose={() => {
                                setExplorerRoadEdgeId(undefined);
                                setExplorerKeepResource(undefined);
                                setSecondaryMenu(undefined);
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                Choose one resource to keep:
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {(
                                    ["brick", "lumber"] as const
                                ).map((resource) => (
                                    <SecondaryMenuButton
                                        key={resource}
                                        active={
                                            explorerKeepResource === resource
                                        }
                                        onClick={() =>
                                            handleExplorerRoadBuild(
                                                resource
                                            )
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
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
                                                Keep {resource}
                                            </span>
                                        </span>
                                    </SecondaryMenuButton>
                                ))}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU > BUILDER SETTLEMENT DISCOUNT */}
                    {secondaryMenu === "builderSettlement" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Builder Discount"
                            onClose={() => {
                                setBuilderSettlementNodeId(undefined);
                                setBuilderSettlementResource(undefined);
                                setSecondaryMenu(undefined);
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                Choose one resource to keep:
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {(
                                    [
                                        "brick",
                                        "lumber",
                                        "wheat",
                                        "sheep",
                                    ] as const
                                ).map((resource) => (
                                    <SecondaryMenuButton
                                        key={resource}
                                        active={
                                            builderSettlementResource ===
                                            resource
                                        }
                                        onClick={() =>
                                            handleBuilderSettlement(
                                                resource
                                            )
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
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
                                                Keep {resource}
                                            </span>
                                        </span>
                                    </SecondaryMenuButton>
                                ))}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU > BUILDER CITY DISCOUNT */}
                    {secondaryMenu === "builderCity" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Builder Discount"
                            onClose={() => {
                                setBuilderCityNodeId(undefined);
                                setBuilderCityResource(undefined);
                                setSecondaryMenu(undefined);
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                Choose one resource to keep:
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {(
                                    ["ore", "wheat"] as const
                                ).map((resource) => (
                                    <SecondaryMenuButton
                                        key={resource}
                                        active={
                                            builderCityResource ===
                                            resource
                                        }
                                        onClick={() =>
                                            handleBuilderCity(
                                                resource
                                            )
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
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
                                                Keep {resource}
                                            </span>
                                        </span>
                                    </SecondaryMenuButton>
                                ))}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU > MERCHANT DEV CARD DISCOUNT */}
                    {secondaryMenu === "merchantDevelopment" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Merchant Discount"
                            onClose={() => {
                                setMerchantKeepResource(undefined);
                                setSecondaryMenu(undefined);
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                Choose one resource to keep:
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {(
                                    [
                                        "ore",
                                        "wheat",
                                        "sheep",
                                    ] as const
                                ).map((resource) => (
                                    <SecondaryMenuButton
                                        key={resource}
                                        active={
                                            merchantKeepResource ===
                                            resource
                                        }
                                        onClick={() =>
                                            handleMerchantDevelopmentPurchase(
                                                resource
                                            )
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
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
                                                Keep {resource}
                                            </span>
                                        </span>
                                    </SecondaryMenuButton>
                                ))}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU > RENDER DEV CARD OPTIONS*/}
                    {secondaryMenu === "development" && game.phase === "playing" && (
                        <SecondaryMenu
                            title="Play Development Card"
                            onClose={() =>
                                setSecondaryMenu(
                                    undefined
                                )
                            }
                        >
                            {!currentPlayer ||
                                currentPlayer.developmentCards.length === 0 ? (
                                <div
                                    style={{
                                        color:
                                            "#9ca3af",
                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    You have no development cards to play.
                                </div>
                            ) : (
                                <div
                                    ref={developmentCardListRef}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        maxHeight: "492px",
                                        overflowY: "auto",
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
                                                card.type === "victory_point";
                                            const hasRolled =
                                                game.lastDiceRoll !== undefined;
                                            const isPlayable =
                                                card.type !== "victory_point" &&
                                                !isPlayed &&
                                                !isPurchasedThisTurn &&
                                                !currentPlayer.developmentCardPlayedThisTurn &&
                                                (
                                                    hasRolled ||
                                                    card.type === "knight"
                                                );
                                            return (
                                                <SecondaryMenuButton
                                                    key={card.id}
                                                    disabled={!isPlayable}
                                                    onClick={() => {
                                                        if (!isPlayable) {
                                                            return;
                                                        }
                                                        handleSelectDevelopmentCard(card.id);
                                                    }}
                                                >
                                                    {getDevelopmentCardName(card.type)}
                                                    {isVictoryPoint && " (+1 VP)"}
                                                </SecondaryMenuButton>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU >> YEAR OF PLENTY */}
                    {game.phase === "playing" && game.yearOfPlentyPending && secondaryMenu !== "development" && secondaryMenu !== "trade" && (
                        <SecondaryMenu
                            title="Year of Plenty"
                            onClose={
                                handleCloseYearOfPlenty
                            }
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                {yearOfPlentySelection === undefined
                                    ? "Select your two resources:"
                                    : "Select your two resources:"}
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
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "8px",
                                }}
                            >
                                {tradeResources.flatMap((resource) =>
                                    [0, 1].map((slot) => {
                                        const isFirstSelection =
                                            yearOfPlentySelection?.resource === resource &&
                                            yearOfPlentySelection?.slot === slot;
                                        const bankCount =
                                            game.resourceBank[resource];
                                        /*
                                         * Each resource has two buttons.
                                         *
                                         * 0 in bank  -> both disabled
                                         * 1 in bank  -> first enabled, second disabled
                                         * 2+ in bank -> both enabled
                                         */
                                        const unavailableByBank =
                                            bankCount <= slot;
                                        return (
                                            <SecondaryMenuButton
                                                key={`${resource}-${slot}`}
                                                active={isFirstSelection}
                                                disabled={
                                                    isFirstSelection ||
                                                    unavailableByBank
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
                                                        display: "inline-flex",
                                                        alignItems: "center",
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
                                                        {resource}
                                                    </span>
                                                </span>
                                            </SecondaryMenuButton>
                                        );
                                    })
                                )}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* SECONDARY MENU >> MONOPOLY */}
                    {game.phase === "playing" && game.monopolyPending && secondaryMenu !== "development" && secondaryMenu !== "trade" && (
                        <SecondaryMenu
                            title="Monopoly"
                            onClose={
                                handleCloseMonopoly
                            }
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#d1d5db",
                                    marginBottom: "12px",
                                }}
                            >
                                Select a resource to collect:
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {tradeResources.map(
                                    (resource) => (
                                        <SecondaryMenuButton
                                            key={resource}
                                            onClick={() => executeMonopoly(resource)}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    width: "100%",
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                {renderResourceBadge(
                                                    resource,
                                                    1
                                                )}
                                                <span>
                                                    {resource}
                                                </span>
                                            </span>
                                        </SecondaryMenuButton>
                                    )
                                )}
                            </div>
                        </SecondaryMenu>
                    )}
                    {/* ACTION BAR */}
                    {game.phase === "playing" && (
                        <div
                            style={{
                                position: "absolute",
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
                <>
                    {game.robberPending ||
                        game.roadBuildingPending ||
                        game.grandExpeditionPending ? (
                        <RobberActionBar
                            playerColor={currentPlayerColor}
                            roadBuildingPending={
                                game.roadBuildingPending ||
                                game.grandExpeditionPending
                            }
                        />
                    ) : (
                        renderActionBar({
                            hideDice: true,
                        })
                    )}
                    {currentPlayer && (
                        <GuildInformationPanel
                            player={currentPlayer}
                            prosperityRollSequenceActive={prosperityRollSequenceActive}
                            roadBuildingPending={game.roadBuildingPending}
                            robberPending={game.robberPending}
                            onUseSuper={handleUseSuper}
                        />
                    )}
                </>
            }
        />
    );
}
export default App;