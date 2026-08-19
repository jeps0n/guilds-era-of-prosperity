import { GUILDS } from "../data/guilds";
import type { GuildType, Resources } from "../engine/types";
import type { GameState } from "../engine/GameState";
export interface SuperButtonModel {
    id: string;
    resource: keyof Resources;
    label: string;
    disabled: boolean;
    active: boolean;
}
export class SuperOrchestrator {
    static getSuperTitle(guild: GuildType): string {
        const guildData = GUILDS.find(
            (guildData) => guildData.type === guild
        );
        return guildData?.superName ?? "SUPER MENU";
    }
    private selectedButtons: Set<string> = new Set();
    getSuperButtons(game: GameState): SuperButtonModel[] {
        const resources: (keyof Resources)[] = [
            "brick",
            "lumber",
            "wheat",
            "sheep",
            "ore",
        ];
        return resources.flatMap((resource) => {
            const bankCount = game.resourceBank[resource];
            return [1, 2, 3].map((slot) => ({
                id: `${resource}-${slot}`,
                resource,
                label: resource,
                disabled: bankCount < slot,
                active: this.selectedButtons.has(`${resource}-${slot}`),
            }));
        });
    }
    toggleButton(buttonId: string): void {
        if (this.selectedButtons.has(buttonId)) {
            this.selectedButtons.delete(buttonId);
            return;
        }
        if (this.selectedButtons.size >= 3) {
            return;
        }
        this.selectedButtons.add(buttonId);
    }
    getSelectedButtons(): string[] {
        return Array.from(this.selectedButtons);
    }
}