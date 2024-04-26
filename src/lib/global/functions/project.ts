import { writable, type Writable } from "svelte/store";
import type { CompatibilityData, GameData, GameSaveData } from "$lib/global/functions/typings";

// Default game data for initialization and reset
export const currentVersion = "0.1.1";
export const defaultGameData: GameData = {
    metadata: {
        title: "",
        developer: "",
        version: "",
        description: "",
        changelogs: [],
    },
    data: {
        actions: [],
        bodyParts: [],
        states: [],
        interactions: [],
        objects: [],
        restraints: [],
        images: [],
        locations: [],
    },
};

// Represents the current state of the game, overlays the main page?
export const gameStore: Writable<GameData> = writable(defaultGameData);
export const allCompatibilityData: CompatibilityData[] = [
    {
        // No update necessary from 0.1.0
        "versions": ["0.1.0"],
        "finalVersion": "0.1.1",
        "updateFunc": (data: any) => data
    }
]

// Handle backwards compatibility from previous versions
export function updateGameCompatibility(fullGameData: any): GameSaveData {
    // Iterate over compatibility patches and process
    for(const compatibilityData of allCompatibilityData) {
        if(compatibilityData.versions.includes(fullGameData["version"])) {
            // Update the game data and version
            fullGameData = {
                version: compatibilityData.finalVersion,
                game: compatibilityData.updateFunc(fullGameData["game"])
            }
        }
    }

    return fullGameData;
}