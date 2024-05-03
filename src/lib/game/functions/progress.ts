import { get, writable, type Writable } from "svelte/store";
import { gameStore } from "$lib/development/functions/project";
import type { CurrentData, LookupData, ProgressData } from "$lib/game/functions/typings";
import type { GameData, GameStateHint } from "$lib/global/functions/typings";

export const defaultProgressData: ProgressData = {
    dialog: ["", ""], actionText: "", state: "", objects: [], restraints: {}, location: "", 
    newComps: [], locations: [], flags: {}, attempts: 0, needReveal: []
}; // For setting initial data and resetting progress
export const defaultLookupData: LookupData = {
    actions: {}, bodyParts: {}, states: {}, interactions: {}, restraints: {},
    objects: {}, images: {}, locations: {}, hints: {}, choices: {}, nodes: {},
    areas: {}, tags: {}, criteria: {}, results: {},
    flagMap: {}, maxHints: 0
}; // For initializing lookup data for convenience
// export const readyStore: Writable<boolean> = writable(false); // Whether game is ready
export const readyStore: Writable<boolean> = writable(false);
export const progressStore: Writable<ProgressData> = writable(defaultProgressData);
export const undoStore: Writable<ProgressData[]> = writable([]); // For undoing actions
(window as any).progress = () => { console.log(get(progressStore)) };
(window as any).undo = () => { console.log(get(undoStore)) };
(window as any).lookup = () => { console.log(get(lookupStore)) };
let previousProgress: ProgressData | undefined = undefined;
progressStore.subscribe(progressData => { 
    // Skip initial call
    if(progressData.state === "") { return; }

    // Compare current progress (state, objects, restraints, locations, flags)
    const trimmedCurrent = trimProgress(progressData);
    let update = false;
    if(previousProgress === undefined) {
        update = true;
    } else {
        // Don't compare new when determining difference, but do save it
        const trimmed2Current = JSON.parse(JSON.stringify(trimmedCurrent));
        const trimmedPrevious = trimProgress(previousProgress);
        delete trimmed2Current["new"];
        delete trimmedPrevious["new"];
        if(JSON.stringify(trimmed2Current) !== JSON.stringify(trimmedPrevious)) {
            update = true;
        }
    }

    // Update previous and undo if differs
    if(update === true) {
        undoStore.update(undoData => {
            undoData.push(previousProgress as any);
            previousProgress = trimmedCurrent;
            return undoData;
        });
    }
});
export const lookupStore: Writable<LookupData> = writable();

// Trim everything but state, objects, restraints, locations, and flags
function trimProgress(data: any) {
    const keep = ["state", "objects", "restraints", "locations", "flags", "newComps"];
    const deep = JSON.parse(JSON.stringify(data));
    for(const key of Object.keys(deep)) {
        if(keep.includes(key) === false) {
            delete deep[key];
        }
    }
    return deep;
}

// Restore most recent undo (pop from end)
export function restoreUndo() {
    if(get(undoStore).length === 0) { return; }
    
    let lastUndo: any;
    undoStore.update(undoData => {
        lastUndo = undoData.pop();
        return undoData;
    });

    // "Fill in" from default progress data
    const data = JSON.parse(JSON.stringify(defaultProgressData));
    for(const [key, value] of Object.entries(lastUndo)) {
        data[key] = value;
    }
    // Update the current location to the "first ordered" one
    data.location = Object.values(get(gameStore).data.locations
        .filter(locationDataFull => data.locations.includes(locationDataFull[0])))
        [0][0];

    // Force a full re-render
    progressStore.set(data);
}

// Show the current hint as dialog
export function showHint(hintData: GameStateHint, index: number) {
    progressStore.update(progressData => {
        progressData.dialog[0] = `Hint ${index + 1}`;
        progressData.dialog[1] = hintData.text;
        return progressData;
    })
}

// Initialize game via progress store given game data
export function initializeGame() {
    // Reset all data, then work from there
    progressStore.set(JSON.parse(JSON.stringify(defaultProgressData))); 
    undoStore.set([]);

    const gameData = get(gameStore);
    const currentProgressData = get(progressStore);

    // Evaluate the starting state, assume there's only one opening
    const openingState = gameData.data.states
        .filter(stateDataFull => stateDataFull[1].type === "opening")[0];
    currentProgressData.state = openingState[0];

    // Setup initial restraints from body part data
    // Initialize all restraints as "new" as well (highlighted)
    for(const [bodyPartID, bodyPartData] of gameData.data.bodyParts) {
        // Note that not every body part has initial restraints
        if(bodyPartData.initial !== "") {
            // Push initial restraint to list which should appear as ???
            currentProgressData.restraints[bodyPartID] = bodyPartData.initial;
            currentProgressData.needReveal.push(bodyPartData.initial);
            currentProgressData.newComps.push(bodyPartData.initial);
        } 
    }

    // Setup initially accessible locations, don't care about initial
    for(const [locationID, locationData] of gameData.data.locations) {
        // TODO add "at least one location" check, maybe not?
        if(locationData.initial === true) {
            currentProgressData.locations.push(locationID);
        }
    }
    currentProgressData.location = currentProgressData.locations[0];

    // Generate lookup data before returning
    const lookupData = generateLookupData(gameData);

    progressStore.set(currentProgressData);
    lookupStore.set(lookupData);
}

// Generate lookup data from game data for convenience purposes
function generateLookupData(gameData: GameData): LookupData {
    const lookupData: LookupData = JSON.parse(JSON.stringify(defaultLookupData)); 

    lookupData.maxHints = Math.max(...gameData.data.states
        .map(stateDataFull => stateDataFull[1].hints.length));
    lookupData.actions["examine"] = { name: "Examine", junct: "", two: false, order: false };
    for(const [actionID, actionData] of gameData.data.actions) {
        lookupData.actions[actionID] = actionData;
    }
    for(const [bodyPartID, bodyPartData] of gameData.data.bodyParts) {
        lookupData.bodyParts[bodyPartID] = bodyPartData;
    }
    for(const [stateID, stateData] of gameData.data.states) {
        lookupData.states[stateID] = stateData;

        for(const [hintID, hintData] of stateData.hints) {
            if(lookupData.hints[stateID] === undefined) {
                lookupData.hints[stateID] = {};
            }
            lookupData.hints[stateID][hintID] = hintData;
        }

        for(const [choiceID, choiceData] of stateData.choices) {
            if(lookupData.choices[stateID] === undefined) {
                lookupData.choices[stateID] = {};
            }
            lookupData.choices[stateID][choiceID] = choiceData;
        }
    }
    for(const [interactionID, interactionData] of gameData.data.interactions) {
        lookupData.interactions[interactionID] = interactionData;

        for(const [nodeID, nodeData] of interactionData.nodes) {
            if(lookupData.nodes[interactionID] === undefined) {
                lookupData.nodes[interactionID] = {};
            }
            lookupData.nodes[interactionID][nodeID] = nodeData;

            for(const [criteriaID, criteriaData] of nodeData.criteria) {
                if(lookupData.criteria[interactionID] === undefined) {
                    lookupData.criteria[interactionID] = {};
                }
                if(lookupData.criteria[interactionID][nodeID] === undefined) {
                    lookupData.criteria[interactionID][nodeID] = {};
                }
                lookupData.criteria[interactionID][nodeID][criteriaID] = criteriaData;
            }

            for(const [flagMapID, flagMapData] of nodeData.flagMap) {
                if(lookupData.flagMap[interactionID] === undefined) {
                    lookupData.flagMap[interactionID] = {};
                }
                if(lookupData.flagMap[interactionID][nodeID] === undefined) {
                    lookupData.flagMap[interactionID][nodeID] = {};
                }
                lookupData.flagMap[interactionID][nodeID][flagMapID] = flagMapData;
            }
        }
    }
    for(const [restraintID, restraintData] of gameData.data.restraints) {
        lookupData.restraints[restraintID] = restraintData;

        for(const [tagID, tagData] of restraintData.tags) {
            if(lookupData.tags[restraintID] === undefined) {
                lookupData.tags[restraintID] = {};
            }
            lookupData.tags[restraintID][tagID] = tagData;
        }
    }
    for(const [objectID, objectData] of gameData.data.objects) {
        lookupData.objects[objectID] = objectData;

        for(const [tagID, tagData] of objectData.tags) {
            if(lookupData.tags[objectID] === undefined) {
                lookupData.tags[objectID] = {};
            }
            lookupData.tags[objectID][tagID] = tagData;
        }
    }
    for(const [imageID, imageData] of gameData.data.images) {
        lookupData.images[imageID] = imageData;

        for(const [areaID, areaData] of imageData.areas) {
            if(lookupData.areas[imageID] === undefined) {
                lookupData.areas[imageID] = {};
            }
            lookupData.areas[imageID][areaID] = areaData;
        }
    }
    for(const [locationID, locationData] of gameData.data.locations) {
        lookupData.locations[locationID] = locationData;
    }

    return lookupData;
}

// Handle progression to specific next state
export function progressSetState(stateID: string) {
    progressStore.update(progressData => {
        progressData.state = stateID;
        return progressData;
    })
}