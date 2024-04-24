import { get, type Writable, writable } from "svelte/store";
import { type GameData, type GameSaveData } from "./typings";
import { trimGameData, validate } from "./validation";

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

// Represents currently working game project data
export const gameStore: Writable<GameData> = writable(defaultGameData);
export const bundleValidStore: Writable<{ [key: string]: any }> = writable({});
export const validStore: Writable<{ [key: string]: boolean }> = writable({});
export const refreshStore: Writable<boolean> = writable(false);
export const autosaveStore: Writable<boolean> = writable(true);
gameStore.subscribe(_ => { validate() });
(window as any).bundle = () => { console.log(get(bundleValidStore)) }
(window as any).game = () => { console.log(get(gameStore)) }
export const currentStateIDStore: Writable<string | undefined> = writable(undefined);
export const currentInteractionIDStore: Writable<string | undefined> = writable(undefined);
export const currentObjectIDStore: Writable<string | undefined> = writable(undefined);
export const currentRestraintIDStore: Writable<string | undefined> = writable(undefined);
export const currentImageIDStore: Writable<string | undefined> = writable(undefined);
export const currentLocationIDStore: Writable<string | undefined> = writable(undefined);

// Auto-save existing game data every minute
const autosaveStr = window.localStorage.getItem("autosave");
if(autosaveStr !== null) {
    const fullGameData: GameSaveData = JSON.parse(autosaveStr);
    autosaveStore.set(fullGameData.version === currentVersion);
    gameStore.set(fullGameData.game)   
}
setInterval(() => {
    // Only autosave if versions match
    if(get(autosaveStore) === true) {
        quickSave();
    }
}, 60000);

// Reset game data to defaults
export function resetGameData() {
    refreshStore.set(true);
    setTimeout(() => { gameStore.set(defaultGameData); });
    setTimeout(() => { refreshStore.set(false) }, 50);
}

// Quicksave to autosave 
export function quickSave() {
    const trimmedGameStore = trimGameData(get(gameStore));
    const fullGameData = { version: currentVersion, game: trimmedGameStore };

    // Save to local storage
    const saveStr = JSON.stringify(fullGameData)
    window.localStorage.setItem("autosave", saveStr);
}

// Save Game
export function saveGame() {
    const trimmedGameStore = trimGameData(get(gameStore));
    const fullGameData = { version: currentVersion, game: trimmedGameStore };

    // Force download file (TODO: filename), otherwise save dialog
    const saveStr = JSON.stringify(fullGameData)

    // Create a dummy element to click and download
    // https://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
    const saveBlob = new Blob([saveStr], {type: 'text/plain'});
    const url = window.URL.createObjectURL(saveBlob);
    const dummyA = document.createElement('a');
    dummyA.style.display = "none";
    dummyA.href = url;
    dummyA.download = "project.json";
    document.body.appendChild(dummyA);
    dummyA.click();
    window.URL.revokeObjectURL(url);
}