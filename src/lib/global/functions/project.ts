import { writable, type Writable } from "svelte/store";
import type { GameData } from "$lib/global/functions/typings";

// Default game data for initialization and reset
export const currentVersion = "0.1.0";
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

export const gameStore: Writable<GameData> = writable(defaultGameData);