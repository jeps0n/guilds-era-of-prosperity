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
import type { GuildType } from "./game/engine/types";
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
const initialGame = createInitialState();
if (import.meta.env.DEV) {
    validateBoard(initialGame.board);
}
function App() {
    const [game, setGame] = useState(initialGame);
    useEffect(() => {
        console.log("========== GAME STATE UPDATED ==========");

        console.log("Phase:", game.phase);
        console.log("Current Player:", game.currentPlayerId);
        console.log("Placement Action:", game.placementAction);
        console.log("Last Dice Roll:", game.lastDiceRoll);

        console.log("Players:", game.players);

        game.players.forEach((player) => {
            console.log(`--- ${player.name} (${player.id}) ---`);
            console.log("Resources:", player.resources);
            console.log("Settlements:", player.settlements);
            console.log("Roads:", player.roads);
            console.log("Cities:", player.cities);
            console.log("VP:", player.vp);
        });

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
    function handleRollDice() {
        const nextGame = rollDice(game);
        if (nextGame === game) {
            return;
        }
        setGame(nextGame);
    }
    function handleEndTurn() {
        const nextGame = endTurn(game);
        if (nextGame === game) {
            return;
        }
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
    const restoreAvailable =
        canRestorePhaseCheckpoint(game);
    const actionAvailability =
        getActionAvailability(game);
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
                        playerName={currentPlayer.name}
                        availableGuilds={availableGuilds}
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
                        roads={roads}
                        onSelectNode={
                            game.phase === "initial_placement" &&
                                game.placementAction === "settlement"
                                ? handlePlaceSettlement
                                : game.phase === "playing"
                                    ? (nodeId) =>
                                        setGame(
                                            buildSettlement(
                                                game,
                                                game.currentPlayerId,
                                                nodeId
                                            )
                                        )
                                    : undefined
                        }
                        onSelectEdge={
                            game.phase === "initial_placement" &&
                                game.placementAction === "road"
                                ? handlePlaceRoad
                                : game.phase === "playing" &&
                                    actionAvailability.canRoad
                                    ? handleBuildRoad
                                    : undefined
                        }
                    />
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
            bottom={renderActionBar({
                hideDice: true,
            })}
        />
    );
}
export default App;