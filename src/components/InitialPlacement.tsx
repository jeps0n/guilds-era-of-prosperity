import type { GameState } from "../game/engine/GameState";


interface InitialPlacementProps {
  game: GameState;
}


function InitialPlacement({
  game,
}: InitialPlacementProps) {


  const currentPlayer =
    game.players.find(
      (player) =>
        player.id === game.currentPlayerId
    );


  if (!currentPlayer) {
    return null;
  }


  return (

    <div>

      <h2>
        🏘️ Initial Placement
      </h2>


      <h3>
        {currentPlayer.name},{" "}

        {
          game.placementAction === "settlement"
            ? "choose a settlement node"
            : "choose a road edge"
        }

      </h3>


      <p>

        Placement:
        {" "}

        {game.placementStep + 1}

        /

        {game.placementOrder.length}

      </p>


    </div>

  );

}


export default InitialPlacement;