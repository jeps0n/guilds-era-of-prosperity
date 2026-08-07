import type {
  GameEvent,
  GameEventType,
} from "./GameState";
export function createEvent(
  type: GameEventType,
  message: string
): GameEvent {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: Date.now(),
  };
}