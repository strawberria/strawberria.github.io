import { get, type Writable, writable } from "svelte/store";
import { type GameData, type GameInteractionNodeCriteria, type GameInteractionNodeResult, type GameSaveData } from "$lib/global/functions/typings";
import { currentVersion, defaultGameData, updateGameCompatibility } from "$lib/global/functions/project";
import { getLocation, getObject, getRestraint, getState, trimGameData, validate } from "$lib/development/functions/validation";

// Represents currently working game project data
export const gameStore: Writable<GameData> = writable(defaultGameData);
export const bundleValidStore: Writable<{ [key: string]: any }> = writable({});
export const validStore: Writable<{ [key: string]: boolean }> = writable({});
export const copyStore: Writable<[string, any] | undefined> = writable(undefined);
export const refreshStore: Writable<boolean> = writable(false);
// Store for writing a deep copy of the current game data for demoing?
export const playingGameStore: Writable<GameData | undefined> = writable(undefined);
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
    let fullGameData: GameSaveData = JSON.parse(autosaveStr);
    fullGameData = updateGameCompatibility(fullGameData);
    gameStore.set(fullGameData.game)   
}
setInterval(() => {
    quickSave();
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

// Generate title for interaction criteria
export function interactionCriteriaTitle(criteriaData: GameInteractionNodeCriteria, gameData: GameData) {
    let title = "";
    if(criteriaData.type === "objectFound" || criteriaData.type === "objectNotFound") {
        // Retrieve specified object or undefined
        const object = getObject(criteriaData.args[0], gameData);
        const objectName = object ? object[1].name : "";
        const not = criteriaData.type === "objectNotFound" ? "Not " : "";
        title = `[Object ${not}Found] ${objectName}`;
    } else if(criteriaData.type === "restraintWearing" || criteriaData.type === "restraintNotWearing") {
        // Retrieve specified restraint or undefined
        const restraint = getRestraint(criteriaData.args[0], gameData);
        const restraintName = restraint ? restraint[1].name : "";
        const not = criteriaData.type === "restraintNotWearing" ? "Not " : "";
        title = `[${not}Wearing Restraint] ${restraintName}`
    } else if(criteriaData.type === "currentState") {
        // Retrieve specified state or undefined
        const state = getState(criteriaData.args[0], gameData);
        const stateName = state ? state[1].title : "";
        title = `[Current State] ${stateName}`;
    } else if(criteriaData.type === "objectFoundTag" || criteriaData.type === "objectNotFoundTag"
        || criteriaData.type === "restraintWearingTag" || criteriaData.type === "restraintNotWearingTag") {
            const not = criteriaData.type.includes("Not") ? "Not " : "";
            const objectRestraint = criteriaData.type.startsWith("object") 
                ? `Object ${not}Found` : `Restraint ${not}Wearing`;
        title = `[${objectRestraint} Tag] ${criteriaData.args[0]}`;
    } else if(criteriaData.type === "component1Tag" || criteriaData.type === "component2Tag") {
        const oneTwo = criteriaData.type.includes("1") ? "1" : "2";
        title = `[Component ${oneTwo} Tag] ${criteriaData.args[0]}`;
    } else if(criteriaData.type === "flagEquals" || criteriaData.type === "flagNotEquals") {
        const not = criteriaData.type.includes("Not") ? "Not " : "";
        title = `[Flag ${not}Set] ${criteriaData.args[0]}`;
    }

    return title;
}

// Generate title for interaction result
export function interactionResultTitle(resultData: GameInteractionNodeResult, gameData: GameData): string {
    let title = "";
    if(resultData.type === "objectAdd" || resultData.type === "objectRemove") {
        // Retrieve specified object or undefined
        const object = getObject(resultData.args[0], gameData);
        const objectName = object ? object[1].name : "";
        console.log(resultData.args[0])
        title = resultData.type === "objectAdd"
            ? `[Add Object] ${objectName}` : `[Remove Object] ${objectName}`;
    } else if(resultData.type === "restraintAdd" || resultData.type === "restraintRemove") {
        // Retrieve specified restraint or undefined
        const restraint = getRestraint(resultData.args[0], gameData);
        const restraintName = restraint ? restraint[1].name : "";
        title = resultData.type === "restraintAdd"
            ? `[Add Restraint] ${restraintName}` : `[Remove Restraint] ${restraintName}`;
    } else if(resultData.type === "locationAdd" || resultData.type === "locationRemove"
        || resultData.type === "locationUpdate") {
        // Retrieve specified location or undefined
        const locationA = getLocation(resultData.args[0], gameData);
        const locationNameA = locationA ? locationA[1].name : "";
        const locationB = getLocation(resultData.args[1], gameData);
        const locationNameB = locationB ? locationB[1].name : "";
        title = resultData.type === "locationAdd"
            ? `[Add Location] ${locationNameA}` : resultData.type === "locationRemove"
            ? `[Remove Location] ${locationNameA}` : `[Update Location] ${locationNameA} => ${locationNameB}`;
    } else if(resultData.type === "stateSet") {
        // Retrieve specified state or undefined
        const state = getState(resultData.args[0], gameData);
        const stateName = state ? state[1].title : "";
        title = `[Set State] ${stateName}`;
    } else if(resultData.type === "dialogShow" || resultData.type === "flagSet") {
        title = resultData.type === "dialogShow"
            ? `[Dialog] "${resultData.args[0]}"`
            : `[Set Flag] "${resultData.args[0]}" = "${resultData.args[0]}"`;
    }
    console.log(title)
    
    return title;
}