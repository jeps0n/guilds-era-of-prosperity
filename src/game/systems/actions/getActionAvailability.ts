import type { GameState } from "../../engine/GameState";
import { hasPlayableKnight } from "../developmentCards/hasPlayableKnight";
import { hasLegalRoadPlacement } from "../building/buildRoad";
import { hasLegalSettlementPlacement } from "../building/buildSettlement";
import { hasLegalCityPlacement } from "../building/buildCity";
export interface ActionAvailability {
    // Actions the current player can currently take.
    canRollDice: boolean;
    canTrade: boolean;
    canRoad: boolean;
    grandExpeditionCanRoad: boolean;
    canSettlement: boolean;
    canCity: boolean;
    canBuyDevelopmentCard: boolean;
    canPlayDevelopmentCard: boolean;
    hasPlayableKnight: boolean;
    canEndTurn: boolean;
}
// Physical piece availability.
// These only determine whether the player still has
// pieces remaining in their supply.
function hasRoadPiece(
    player: GameState["players"][number]
): boolean {
    return player.roads.length < 15;
}
function hasSettlementPiece(
    player: GameState["players"][number]
): boolean {
    return player.settlements.length < 5;
}
function hasCityPiece(
    player: GameState["players"][number]
): boolean {
    return player.cities.length < 4;
}
export function getActionAvailability(
    game: GameState
): ActionAvailability {
    // Find the player whose turn it is.
    const currentPlayer = game.players.find(
        (player) =>
            player.id === game.currentPlayerId
    );
    // No current player means no actions are available.
    if (!currentPlayer) {
        return {
            canRollDice: false,
            canTrade: false,
            canRoad: false,
            grandExpeditionCanRoad: false,
            canSettlement: false,
            canCity: false,
            canBuyDevelopmentCard: false,
            canPlayDevelopmentCard: false,
            hasPlayableKnight: false,
            canEndTurn: false,
        };
    }
    // Resources are checked throughout the availability rules.
    const resources = currentPlayer.resources;
    // Check whether the player still has physical pieces available.
    const hasRoad = hasRoadPiece(currentPlayer);
    const hasSettlement = hasSettlementPiece(currentPlayer);
    const hasCity = hasCityPiece(currentPlayer);
    // Explorer can use one discounted road per turn.
    const isExplorer =
        currentPlayer.guild === "explorer";
    const explorerPassiveAvailable =
        isExplorer &&
        !currentPlayer.guildPassiveUsedThisTurn;
    // Count how many road resources the player has.
    // Explorer needs at least one when the passive is available.
    const roadResourcesAvailable =
        ["brick", "lumber"].filter(
            (resource) =>
                resources[
                resource as "brick" | "lumber"
                ] >= 1
        ).length;
    // Grand Expedition allows a free road(s) before & after the normal roll.
    const grandExpeditionCanRoad =
        game.grandExpeditionPending;
    // Determine whether the player can build a road.
    const canRoad =
        hasRoad &&
        hasLegalRoadPlacement(
            game,
            currentPlayer.id
        ) &&
        (
            grandExpeditionCanRoad ||
            (
                (
                    // Explorer can use the discounted road if
                    // at least one road resource is available.
                    explorerPassiveAvailable &&
                    roadResourcesAvailable >= 1
                ) ||
                (
                    // Everyone else needs the normal road cost.
                    !explorerPassiveAvailable &&
                    resources.brick >= 1 &&
                    resources.lumber >= 1
                )
            )
        );
    // Builder can use one discounted settlement or city per turn.
    const isBuilder =
        currentPlayer.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !currentPlayer.guildPassiveUsedThisTurn;
    // Count how many settlement resources are available.
    // Builder needs at least three when using the passive.
    const settlementResourcesAvailable =
        (
            [
                "brick",
                "lumber",
                "wheat",
                "sheep",
            ] as const
        ).filter(
            (resource) =>
                resources[resource] >= 1
        ).length;
    // Determine whether the player can build a settlement.
    const canSettlement =
        hasSettlement &&
        hasLegalSettlementPlacement(
            game,
            currentPlayer.id
        ) &&
        (
            (
                // Builder can omit one settlement resource.
                builderPassiveAvailable &&
                settlementResourcesAvailable >= 3
            ) ||
            (
                // Everyone else needs the full settlement cost.
                !builderPassiveAvailable &&
                resources.brick >= 1 &&
                resources.lumber >= 1 &&
                resources.wheat >= 1 &&
                resources.sheep >= 1
            )
        );
    // Builder can omit one resource from the normal city cost.
    const builderCanAffordDiscountedCity =
        (
            // Omit one ore.
            resources.ore >= 2 &&
            resources.wheat >= 2
        ) ||
        (
            // Omit one wheat.
            resources.ore >= 3 &&
            resources.wheat >= 1
        );
    // Determine whether the player can build a city.
    const canCity =
        hasCity &&
        hasLegalCityPlacement(
            game,
            currentPlayer.id
        ) &&
        (
            (
                // Builder can use the discounted city cost.
                builderPassiveAvailable &&
                builderCanAffordDiscountedCity
            ) ||
            (
                // Everyone else needs the full city cost.
                !builderPassiveAvailable &&
                resources.ore >= 3 &&
                resources.wheat >= 2
            )
        );
    // Merchant can use one discounted development-card
    // purchase per turn.
    const isMerchant =
        currentPlayer.guild === "merchant";
    const merchantPassiveAvailable =
        isMerchant &&
        !currentPlayer.guildPassiveUsedThisTurn;
    // Resources normally required to buy a development card.
    const requiredDevelopmentResources = [
        "ore",
        "wheat",
        "sheep",
    ] as const;
    // Count how many development-card resources are available.
    const developmentResourcesAvailable =
        requiredDevelopmentResources.filter(
            (resource) =>
                resources[resource] >= 1
        ).length;
    // Determine whether the player can buy a development card.
    const canBuyDevelopmentCard =
        game.developmentDeck.length > 0 &&
        (
            (
                // Normal purchase requires all three resources.
                !merchantPassiveAvailable &&
                requiredDevelopmentResources.every(
                    (resource) =>
                        resources[resource] >= 1
                )
            ) ||
            (
                // Merchant can buy with any two resources
                // while the passive is still available.
                merchantPassiveAvailable &&
                developmentResourcesAvailable >= 2
            )
        );
    // The player has rolled if a dice result exists.
    const hasRolled =
        game.lastDiceRoll !== undefined;
    // Trading is available after the dice have been rolled.
    const canTrade =
        game.phase === "playing" &&
        hasRolled;
    // Check whether the player owns any development cards.
    const hasDevelopmentCard =
        currentPlayer.developmentCards.length > 0;
    // Development cards normally require a dice roll first.
    const canPlayDevelopmentCard =
        game.phase === "playing" &&
        hasRolled &&
        hasDevelopmentCard;
    // Knights are the exception: they can be played before rolling.
    const playerHasPlayableKnight =
        game.phase === "playing" &&
        hasPlayableKnight(
            game,
            currentPlayer.id
        );
    // Return the final action availability for the current player.
    return {
        // Dice can be rolled once per turn, unless the robber is pending.
        canRollDice:
            game.phase === "playing" &&
            !hasRolled &&
            !game.robberPending &&
            !game.grandExpeditionPending &&
            !game.masterBuilderPending,
        // Trading requires a completed dice roll.
        canTrade:
            canTrade,
        // Normal roads require a roll.
        // Grand Expedition roads are the exception.
        canRoad:
            game.phase === "playing" &&
            (hasRolled || grandExpeditionCanRoad) &&
            canRoad,
        // Used separately by the UI for Grand Expedition road placement.
        grandExpeditionCanRoad:
            grandExpeditionCanRoad,
        // Settlements require a dice roll.
        canSettlement:
            game.phase === "playing" &&
            hasRolled &&
            canSettlement,
        // Cities require a dice roll.
        canCity:
            game.phase === "playing" &&
            hasRolled &&
            canCity,
        // Development-card purchases require a dice roll.
        canBuyDevelopmentCard:
            game.phase === "playing" &&
            hasRolled &&
            canBuyDevelopmentCard,
        canPlayDevelopmentCard:
            canPlayDevelopmentCard,
        hasPlayableKnight:
            playerHasPlayableKnight,
        // The turn can end after the dice have been rolled.
        canEndTurn:
            game.phase === "playing" &&
            hasRolled,
    };
}