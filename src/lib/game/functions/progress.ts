import { get, writable, type Writable } from "svelte/store";
import type { ProgressData } from "$lib/game/functions/typings";
import { defaultGameData } from "$lib/global/functions/project";
import type { GameData } from "$lib/global/functions/typings";

export const defaultProgressData: ProgressData = {
    state: "", objects: [], restraints: {}, locations: [], flags: {}, attempts: 0, needReveal: []
}; // For setting initial data and resetting progress
export const gameStore: Writable<GameData> = writable(defaultGameData);
// export const readyStore: Writable<boolean> = writable(false); // Whether game is ready
export const progressStore: Writable<ProgressData> = writable(defaultProgressData);
export const undoStore: Writable<ProgressData[]> = writable([]); // For undoing actions

// Initialize game via progress store given game data
export function initializeGame(gameData: GameData) {
    // Set the current game store, then work from there
    // readyStore.set(false);
    gameStore.set(gameData);
    const deepProgressData = JSON.parse(JSON.stringify(defaultProgressData));
    progressStore.set(deepProgressData); // Deep copy default progressData
    const currentProgressData = get(progressStore);

    // Evaluate the starting state, assume there's only one opening
    const openingState = gameData.data.states
        .filter(stateDataFull => stateDataFull[1].type === "opening")[0];
    currentProgressData.state = openingState[0];

    // Setup initial restraints from body part data
    for(const [bodyPartID, bodyPartData] of gameData.data.bodyParts) {
        // Note that not every body part has initial restraints
        if(bodyPartData.initial !== "") {
            // Push initial restraint to list which should appear as ???
            currentProgressData.restraints[bodyPartID] = bodyPartData.initial;
            currentProgressData.needReveal.push(bodyPartData.initial);
        } 
    }

    // Setup initially accessible locations
    for(const [locationID, locationData] of gameData.data.locations) {
        // TODO add "at least one location" check, maybe not?
        if(locationData.initial === true) {
            currentProgressData.locations.push(locationID);
        }
    }

    progressStore.set(currentProgressData);
    // readyStore.set(true);
}