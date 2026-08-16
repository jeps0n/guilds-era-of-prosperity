import type { GameState } from "../../engine/GameState";
import { beginSecondaryRoll } from "../../guilds/prosperity/rollSecondaryDice";
export function endTurn(
  game: GameState
): GameState {
  if (game.phase !== "playing") {
    return game;
  }
  if (game.lastDiceRoll === undefined) {
    return game;
  }
  /*
   * Prosperity normally requires a secondary roll
   * before the turn can officially end.
   *
   * EXCEPTION:
   * If the current player has unlocked their Super
   * ability, they no longer need to roll the
   * Prosperity secondary dice.
   */
  if (game.era === "prosperity") {
    const currentPlayer =
      game.players.find(
        (player) =>
          player.id ===
          game.currentPlayerId
      );
    /*
     * A player who has unlocked their Super
     * bypasses the secondary-roll phase entirely.
     */
    const superUnlocked =
      currentPlayer?.superUnlocked === true;
    if (!superUnlocked) {
      /*
       * Begin the secondary-roll phase.
       *
       * The current player remains active.
       */
      if (game.era === "prosperity") {
        const currentPlayer = game.players.find(
          (player) =>
            player.id === game.currentPlayerId
        );
        /*
         * Once the player has unlocked their Super,
         * they no longer need to make Prosperity
         * secondary rolls.
         */
        if (currentPlayer?.superUnlocked) {
          return completeTurn(game);
        }
        /*
         * No secondary roll has started yet.
         * Begin the secondary-roll phase.
         */
        if (
          !game.secondaryRollPending &&
          game.secondaryRoll === undefined
        ) {
          return beginSecondaryRoll(game);
        }
        /*
         * The secondary roll is still being resolved.
         */
        if (game.secondaryRollPending) {
          return game;
        }
        /*
         * The secondary roll has been resolved.
         * Continue to completeTurn().
         */
      }
      /*
       * The secondary roll has been resolved.
       * Continue below and officially close
       * the current player's turn.
       */
    }
  }
  return completeTurn(game);
}
/*
 * Officially closes the current turn
 * and advances to the next player.
 */
function completeTurn(
  game: GameState
): GameState {
  const nextPlayer =
    game.players.find(
      (player) =>
        player.id !==
        game.currentPlayerId
    );
  if (!nextPlayer) {
    return game;
  }
  /*
   * Reset flags belonging to the
   * completed player's turn.
   */
  const updatedPlayers =
    game.players.map((player) => {
      if (
        player.id !==
        game.currentPlayerId
      ) {
        return player;
      }
      return {
        ...player,
        developmentCardsPurchasedThisTurn: [],
        developmentCardPlayedThisTurn: false,
        guildPassiveUsedThisTurn: false,
      };
    });
  /*
   * Advance the turn and clear
   * turn-specific state.
   */
  return {
    ...game,
    players: updatedPlayers,
    currentPlayerId: nextPlayer.id,
    turnNumber:
      game.turnNumber + 1,
    lastDiceRoll: undefined,
    /*
     * Secondary roll is finished.
     */
    secondaryRoll: undefined,
    secondaryRollPending: false,
    /*
     * Cancel any unfinished
     * Year of Plenty selection.
     */
    yearOfPlentyPending: false,
    yearOfPlentyCardId: undefined,
    yearOfPlentyFirstResource: undefined,
  };
}