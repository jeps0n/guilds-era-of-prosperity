import { useEffect } from "react";
import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";
import BoardSurface from "./board/BoardSurface";
import VictoryAnnouncement from "./board/VictoryAnnouncement";
import ProsperityBoardOverlay from "./board/ProsperityBoardOverlay";
interface BoardViewProps {
  // Prosperity features
  era: string;
  secondaryRollPending?: boolean;
  secondaryRoll?: number;
  secondaryRolls?: number[];
  superUnlocked?: boolean;
  secondaryRollRevealing?: boolean;
  superUnlockRevealing?: boolean;
  superUnlockPlayerName?: string;
  superUnlockPlayerColor?: string;
  onRollSecondaryDice?: () => void;
  // Base game features
  board: Board;
  settlements: Settlement[];
  cities: {
    nodeId: string;
    playerId: string;
  }[];
  roads: {
    id: string;
    edgeId: string;
    playerId: string;
  }[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  robberPending?: boolean;
  robberTileId?: string;
  onSelectTile?: (tileId: string) => void;
  playerColor?: string;
  // Winner
  winnerName?: string;
  guildName?: string;
  winnerRevealing?: boolean;
}
function BoardView({
  era,
  secondaryRollPending = false,
  secondaryRoll,
  secondaryRolls = [],
  superUnlocked = false, // used for super announcement animation timing
  secondaryRollRevealing = false, // used for super announcement animation timing
  superUnlockRevealing = false,
  onRollSecondaryDice,
  board,
  settlements,
  cities,
  roads,
  onSelectNode,
  onSelectEdge,
  robberPending = false,
  robberTileId,
  onSelectTile,
  playerColor,
  // Winner
  winnerName,
  guildName,
  winnerRevealing = false,
}: BoardViewProps) {
  void superUnlocked;
  void secondaryRollRevealing;
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "r" &&
        secondaryRollPending &&
        onRollSecondaryDice
      ) {
        event.preventDefault();
        onRollSecondaryDice();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [secondaryRollPending, onRollSecondaryDice]);
  /*
   * Keep the secondary-roll overlay visible
   * while the result is being revealed.
   *
   * rollSecondaryDice() clears secondaryRollPending
   * immediately, so the presence of secondaryRoll
   * keeps the result visible until endTurn() clears it.
   */
  const showSecondaryRoll =
    !superUnlockRevealing &&
    (secondaryRollPending ||
      secondaryRoll !== undefined);
  return (
    <div
      className="board-view"
      onDragStart={(event) => event.preventDefault()}
    >
      <BoardSurface
        board={board}
        settlements={settlements}
        cities={cities}
        roads={roads}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
        robberPending={robberPending}
        robberTileId={robberTileId}
        onSelectTile={onSelectTile}
        playerColor={playerColor}
        winnerRevealing={winnerRevealing}
      />
      <ProsperityBoardOverlay
        era={era}
        showSecondaryRoll={showSecondaryRoll}
        secondaryRoll={secondaryRoll}
        secondaryRolls={secondaryRolls}
        superUnlockRevealing={superUnlockRevealing}
        onRollSecondaryDice={onRollSecondaryDice}
      />
      <VictoryAnnouncement
        visible={winnerRevealing}
        winnerName={winnerName}
        guildName={guildName}
        playerColor={playerColor}
      />
    </div>
  );
}
export default BoardView;
