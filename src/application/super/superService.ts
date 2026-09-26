import { SuperOrchestrator } from "../../game/guilds/SuperOrchestrator";
// Application-owned session for the currently open Super workflow.
// Presentation consumes this service; presentation never owns game orchestration.
export const superOrchestrator = new SuperOrchestrator();
