import { useState } from "react";

import BoardView from "./components/BoardView";
import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import InitialPlacement from "./components/InitialPlacement";
import PlayerPanel from "./components/PlayerPanel";

import GameLayout from "./components/layout/GameLayout";

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

import type { GuildType } from "./game/engine/types";

import {
  endTurn,
} from "./game/systems/turn/endTurn";


const initialGame =
createInitialState();


if (import.meta.env.DEV) {

  validateBoard(
    initialGame.board
  );

}


function App() {


const [game, setGame] =
useState(
  initialGame
);



function handleGuildSelection(
guild: GuildType
) {

setGame(
  selectGuild(
    game,
    game.currentPlayerId,
    guild
  )
);

}



function handlePlaceSettlement(
nodeId: string
) {

setGame(
  placeSettlement(
    game,
    game.currentPlayerId,
    nodeId
  )
);

}



function handlePlaceRoad(
edgeId: string
) {

setGame(
  placeRoad(
    game,
    game.currentPlayerId,
    edgeId
  )
);

}



function handleEndTurn() {

setGame(
  endTurn(game)
);

}



const currentPlayer =
game.players.find(
player =>
player.id === game.currentPlayerId
);



const availableGuilds: GuildType[] =
(
[
"builder",
"explorer",
"merchant",
] as GuildType[]
)
.filter(
guild =>
!game.players.some(
player =>
player.guild === guild
)
);



const roads =
game.players.flatMap(
player =>
player.roads.map(
(edgeId,index)=>({

id:
`${player.id}-road-${index}`,

edgeId,

playerId:
player.id,

})
)
);



if (
game.phase === "guild_selection" &&
currentPlayer &&
currentPlayer.guild === undefined
) {


return (

<GameLayout

header={
<h1>
Guilds: Era of Prosperity
</h1>
}


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

/>

);


}



return (

<GameLayout


header={

<h1>
Guilds: Era of Prosperity
</h1>

}



board={

<>

<BoardView

board={
game.board
}


settlements={
game.players.flatMap(
player =>
player.settlements
)
}


roads={
roads
}



onSelectNode={

game.phase === "initial_placement" &&
game.placementAction === "settlement"

?

handlePlaceSettlement

:

undefined

}



onSelectEdge={

game.phase === "initial_placement" &&
game.placementAction === "road"

?

handlePlaceRoad

:

undefined

}

/>



{
game.phase === "initial_placement" && (

<InitialPlacement

game={game}

/>

)
}


</>

}



rightSidebar={

<>

<GameStatus

game={game}

onEndTurn={
handleEndTurn
}

/>


<PlayerPanel

game={game}

/>


</>

}


/>

);

}


export default App;