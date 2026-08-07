import type { GameState } from "../../engine/GameState";
const DEVELOPMENT_CARD_COST = {
  ore: 1,
  wheat: 1,
  sheep: 1,
};
export function buyDevelopmentCard(
  state: GameState,
  playerId: string
): GameState {
  const player =
    state.players.find(
      p => p.id === playerId
    );
  if (!player) {
    throw new Error(
      "Player not found"
    );
  }
  const canAfford =
    player.resources.ore >= 1 &&
    player.resources.wheat >= 1 &&
    player.resources.sheep >= 1;
  if (!canAfford) {
    throw new Error(
      "Not enough resources"
    );
  }
  const card =
    state.developmentDeck[0];
  if (!card) {
    throw new Error(
      "No development cards remaining"
    );
  }
  return {
    ...state,
    players:
      state.players.map(p =>
        p.id === playerId
          ? {
              ...p,
              resources:{
                ...p.resources,
                ore:
                  p.resources.ore - 1,
                wheat:
                  p.resources.wheat - 1,
                sheep:
                  p.resources.sheep - 1,
              },
              developmentCards:[
                ...p.developmentCards,
                card,
              ],
            }
          : p
      ),
    developmentDeck:
      state.developmentDeck.slice(1),
  };
}