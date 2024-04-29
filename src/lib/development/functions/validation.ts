import { get, writable, type Writable } from "svelte/store";
import { type GameData, type GameInteraction } from "$lib/global/functions/typings"
import { bundleValidStore, gameStore, validStore } from "$lib/development/functions/project";

// Represents validity of data from gameDataStore
export const tabValidStore: Writable<{ [key: string]: boolean}> = writable({});
export const componentValidStore: Writable<{ [key: string]: boolean}> = writable({});

// Recursively checks whether all nested values are true
export function recursiveCheckValid(checkData: any) {
    if(typeof checkData !== "object") {
        return Boolean(checkData);
    } else if(checkData !== null) {
        for(const data of Object.values(checkData)) {
            const dataValid = recursiveCheckValid(data);
            if(dataValid === false) {
                return false;
            }
        }
    }

    return true;
}

let lastValidationMS = 0;
export function validate() {
    const now = new Date().getTime();
    if(now - lastValidationMS < 100) {
        return;
    }
    lastValidationMS = now;

    const projectData = get(gameStore);
    const bundleValidData = get(bundleValidStore);
    const validData = get(validStore);

    // Validate individual aspects for bundleValidStore
    const debugData: any = {};
    [validData["metadata"], debugData["metadata"], bundleValidData["metadata"]] = checkMetadataValid(projectData);
    [validData["states"], debugData["states"], bundleValidData["states"]] = checkStatesValid(projectData);
    [validData["interactions"], debugData["interactions"], bundleValidData["interactions"]] = checkInteractionsValid(projectData);
    [validData["restraints"], debugData["restraints"], bundleValidData["restraints"]] = checkRestraintsValid(projectData);
    [validData["objects"], debugData["objects"], bundleValidData["objects"]] = checkObjectsValid(projectData);
    [validData["images"], debugData["images"], bundleValidData["images"]] = checkImagesValid(projectData);
    [validData["locations"], debugData["locations"], bundleValidData["locations"]] = checkLocationsValid(projectData);

    bundleValidStore.set(bundleValidData);
    validStore.set(validData);
    (window as any).valid = validData;
    (window as any).bundle = debugData;
}

// Trim various aspects of project data:
// - Ensure that all references are valid
export function trimGameData(gameData: GameData): GameData {
    const actionsSet = new Set(gameData.data.actions.map(data => data[0]));
    const statesSet = new Set(gameData.data.states.map(data => data[0]));
    // All components: body parts, objects, restraints
    // const bodyPartsSet = new Set(gameData.data.bodyParts.map(data => data[0]));

    // Trim states
    for(const [_, stateData] of gameData.data.states) {
        // Validate next [state]
        if(statesSet.has(stateData.nextState) === false) {
            stateData.nextState = "";
        }
        // Validate next [state] for choices
        for(const [_, choiceData] of stateData.choices) {
            if(statesSet.has(choiceData.state) === false) {
                choiceData.state = "";
            }
        }
    }

    // Trim interactions
    for(const [_, interactionData] of gameData.data.interactions) {
        // Validate interaction trigger [action]
        if(actionsSet.has(interactionData.action) === false) {
            interactionData.action = "";
        }
        // Validate interaction [component] arguments
        for(let index = 0; index < interactionData.args.length; index++) {
            filterInPlace(interactionData.args[index], 
                (componentID) => isComponentValid(componentID, gameData) === true)
        }
        // Validate interaction active [state]s
        filterInPlace(interactionData.states, (stateID) => statesSet.has(stateID))
    }

    return gameData;
}

// Checks whether metadata contents are valid - mostly just text + actions
export function checkMetadataValid(gameData: GameData): [boolean, any, any] {
    const titleValid = gameData.metadata.title !== "";
    const developerValid = gameData.metadata.developer !== "";
    const versionValid = gameData.metadata.version !== "";
    const descriptionValid = gameData.metadata.description !== "";

    // Ensure that all actions have fields populated
    const actionsValidData: any[] = [];
    for(const [_, actionData] of gameData.data.actions) {
        actionsValidData.push({
            name: actionData.name !== "",
            junct: !actionData.two || actionData.junct !== "",
        });
    }
    const actionsValid = actionsValidData.map(data => recursiveCheckValid(data));

    // Ensure that all body parts have fields populated
    const bodyPartsValidData: any[] = [];
    for(const [_, bodyPartData] of gameData.data.bodyParts) {
        bodyPartsValidData.push({
            name: bodyPartData.name !== "",
        });
    }
    const bodyPartsValid = bodyPartsValidData.map(data => recursiveCheckValid(data));

    // Ensure that all changelogs have fields populated
    const changelogsValidData: any[] = [];
    for(const [_, changelogData] of gameData.metadata.changelogs) {
        changelogsValidData.push({
            version: changelogData.version !== "",
            text: changelogData.text !== "",
        });
    }
    const changelogsValid = changelogsValidData.map(data => recursiveCheckValid(data));

    const bundled = {
        title: titleValid,
        developer: developerValid,
        version: versionValid,
        description: descriptionValid,
        actions: actionsValid,
        bodyParts: bodyPartsValid,
        changelogs: changelogsValid,
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, bundled, bundled];
}

// Checks whether state contents are valid
export function checkStatesValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all states are valid
    const statesValidData: any[] = [];
    for(const [_, stateData] of gameData.data.states) {
        const hintsValidData: any[] = [];
        const choicesValidData: any[] = [];
        statesValidData.push({
            title: stateData.title !== "",
            description: stateData.description !== "",
            nextState: stateData.type === "choice" || stateData.type === "ending" || stateData.type === "badEnd"
                ? true : stateData.type !== "normal"
                    ? getState(stateData.nextState, gameData) !== undefined
                    : true,
            hints: hintsValidData,
            choices: choicesValidData, 
        });

        // Ensure that hint data is valid
        const forceValidHint = stateData.type !== "normal";
        for(const [_, hintData] of stateData.hints) {
            hintsValidData.push({
                title: forceValidHint || hintData.title !== "",
                attempts: forceValidHint || hintData.attempts > 0 && Number.isInteger(hintData.attempts),
                text: forceValidHint || hintData.text !== "",
            });
        }

        // Ensure that node data is valid
        const forceValidChoice = stateData.type !== "choice";
        for(const [_, choiceData] of stateData.choices) {
            choicesValidData.push({
                text: forceValidChoice || choiceData.text !== "",
                state: forceValidChoice || getState(choiceData.state, gameData) !== undefined,
                flags: choiceData.flagKey !== "" ? choiceData.flagVal !== "" : true
            })
        }
    }
    const statesValid = statesValidData.map(data => recursiveCheckValid(data));
    const hintsValid = statesValidData.map(data => data.hints
        .map((data2: any) => recursiveCheckValid(data2)));
    const choicesValid = statesValidData.map(data => data.choices
        .map((data2: any) => recursiveCheckValid(data2)));

    // Check whether there is more than one opening state
    const openingValid = gameData.data.states
        .map(data => data[1])
        .filter(stateData => stateData.type === "opening")
        .length === 1;

    const bundled = {
        states: statesValid,
        hints: hintsValid,
        choices: choicesValid,
        opening: openingValid,
    };
    const valid = recursiveCheckValid(bundled);

    return [valid, statesValidData, bundled];
}

export function checkInteractionsValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all interactions are valid
    const interactionsValidData: any[] = [];
    for(const [_, interactionData] of gameData.data.interactions) {
        const actionDataFull = getAction(interactionData.action, gameData);
        const nodesValidData: any[] = [];
        interactionsValidData.push({
            title: interactionData.title !== "",
            action: actionDataFull !== undefined,
            // Check whether both contain any same elements?
            args: (interactionData.args[0].length > 0 && areComponentsValid(interactionData.args[0], gameData) )
                && ((actionDataFull !== undefined && actionDataFull[1].two)
                    ? interactionData.args[1].length > 0 && areComponentsValid(interactionData.args[1], gameData)
                    : true),
            starting: interactionData.nodes.filter(
                    ([_, nodeData]) => nodeData.start === true
                ).length === 1,
            nodes: nodesValidData,
        });

        // Ensure that node data is valid
        for(const [_, nodeData] of interactionData.nodes) {
            const criteriaValidData: any[] = [];
            const resultsValidData: any[] = [];
            nodesValidData.push({
                title: nodeData.title.length > 0,
                criteria: criteriaValidData,
                results: resultsValidData,
                nextPass: nodeData.end 
                    || getInteractionNode(nodeData.nextPass, interactionData) !== undefined,
                nextFail: (!nodeData.type.startsWith("criteria")) 
                    || getInteractionNode(nodeData.nextFail, interactionData) !== undefined,
            });

            // Ensure that criteria data is valid
            const forceValidCriteria = !nodeData.type.startsWith("criteria");
            for(const [_, criteriaData] of nodeData.criteria) {
                const argsValid = (criteriaData.type === "flagEquals" || criteriaData.type === "flagNotEquals")
                        ? [criteriaData.args[0].length > 0, criteriaData.args[1].length > 0]
                    : (criteriaData.type === "currentState")
                        ? [getState(criteriaData.args[0], gameData) !== undefined, true]
                    : (criteriaData.type === "objectFound" || criteriaData.type === "objectNotFound")
                        ? [getObject(criteriaData.args[0], gameData) !== undefined, getObject(criteriaData.args[1], gameData) !== undefined]
                    : (criteriaData.type === "restraintWearing" || criteriaData.type === "restraintNotWearing")
                        ? [getRestraint(criteriaData.args[0], gameData) !== undefined, getRestraint(criteriaData.args[1], gameData) !== undefined]
                    : [criteriaData.args[0].length > 0, true];
                criteriaValidData.push({
                    // title: criteriaData.title.length > 0,
                    args: argsValid.map(v => forceValidCriteria || v),
                });
            }

            // Ensure that result data is valid
            const forceValidResult = !nodeData.type.startsWith("execute");
            for(const [_, resultData] of nodeData.results) {
                const argsValid = (resultData.type === "flagSet")
                        ? [resultData.args[0].length > 0, resultData.args[1].length > 0]
                    : (resultData.type === "dialogShow")
                        ? [resultData.args[0].length > 0, true]
                    : (resultData.type === "objectAdd" || resultData.type === "objectRemove")
                        ? [getObject(resultData.args[0], gameData) !== undefined, true]
                    : (resultData.type === "restraintAdd" || resultData.type === "restraintRemove")
                        ? [getRestraint(resultData.args[0], gameData) !== undefined, true]
                    : (resultData.type === "stateSet")
                        ? [getState(resultData.args[0], gameData) !== undefined, true]
                    : (resultData.type === "locationUpdate")
                        // What about location being identical... idc I guess
                        ? [getLocation(resultData.args[0], gameData) !== undefined, getLocation(resultData.args[1], gameData) !== undefined]
                    : [getLocation(resultData.args[0], gameData) !== undefined, true]; // Location
                resultsValidData.push({
                    // title: resultData.title.length > 0,
                    args: argsValid.map(v => v || forceValidResult)
                });
            }
        }
    }
    const interactionsValid = interactionsValidData.map(data => recursiveCheckValid(data));
    const startingsValid = interactionsValidData.map(data => data["starting"]);
    const nodesValid = interactionsValidData.map(data => data.nodes
        .map((data2: any) => recursiveCheckValid(data2)));
    const criteriaValid = interactionsValidData.map(data => data.nodes
        .map((data2: any) => data2.criteria
            .map((data3: any) => recursiveCheckValid(data3))));
    const resultsValid = interactionsValidData.map(data => data.nodes
        .map((data2: any) => data2.results
            .map((data3: any) => recursiveCheckValid(data3))));

    const bundled = {
        interactions: interactionsValid,
        startings: startingsValid,
        nodes: nodesValid,
        criteria: criteriaValid,
        results: resultsValid
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, interactionsValidData, bundled];
}

// Checks whether objects are all valid
export function checkObjectsValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all actions have fields populated
    const objectsValidData: any[] = [];
    for(const [_, objectData] of gameData.data.objects) {
        const tagsValidData: any[] = [];
        objectsValidData.push({
            name: objectData.name !== "",
            examine: objectData.examine !== "",
            tags: tagsValidData
        });

        // Ensure that tag data is valid
        for(const [_, tagData] of objectData.tags) {
            tagsValidData.push({
                key: tagData.key !== "",
            })
        }
    }
    const objectsValid = objectsValidData.map(data => recursiveCheckValid(data));
    const tagsValid = objectsValidData.map(data => data.tags
        .map((data2: any) => recursiveCheckValid(data2)));

    const bundled = {
        objects: objectsValid,
        tags: tagsValid
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, objectsValidData, bundled];
}

// Checks whether restraints are all valid
export function checkRestraintsValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all restraints have fields populated
    const restraintsValidData: any[] = [];
    for(const [_, restraintData] of gameData.data.restraints) {
        const tagsValidData: any[] = [];
        restraintsValidData.push({
            name: restraintData.name !== "",
            examine: restraintData.examine !== "",
            bodyPart: getBodyPart(restraintData.bodyPart, gameData) !== undefined,
            tags: tagsValidData
        });

        // Ensure that tag data is valid
        for(const [_, tagData] of restraintData.tags) {
            tagsValidData.push({
                key: tagData.key !== "",
            })
        }
    }
    const restraintsValid = restraintsValidData.map(data => recursiveCheckValid(data));
    const tagsValid = restraintsValidData.map(data => data.tags
        .map((data2: any) => recursiveCheckValid(data2)));

    const bundled = {
        restraints: restraintsValid,
        tags: tagsValid
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, restraintsValidData, bundled];
}

// Checks whether images are all valid
export function checkImagesValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all images have fields populated
    const imagesValidData: any[] = [];
    for(const [_, imageData] of gameData.data.images) {
        const areasValidData: any[] = [];
        imagesValidData.push({
            title: imageData.title !== "",
            base64: imageData.base64 !== "",
            areas: areasValidData,
        });

        // Ensure that image area data is valid
        for(const [_, areaData] of imageData.areas) {
            areasValidData.push({
                name: areaData.name.length > 0,
                component: isComponentValid(areaData.component, gameData),
                args: areaData.type === "circle"
                    ? areaData.args.length === 4 : areaData.args.length >= 6
            })
        }
    }
    const imagesValid = imagesValidData.map(data => recursiveCheckValid(data));
    const areasValid = imagesValidData.map(data => data.areas
        .map((data2: any) => recursiveCheckValid(data2)));
    const hasLargeImage = gameData.data.images.map(data => data[1])
        .filter(imageData => imageData.base64.length > 1024 * 1024)
        .length > 0 ? 2 : 1; // To not trip the error trigger

    const bundled = {
        images: imagesValid,
        areas: areasValid,
        hasLargeImage: hasLargeImage
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, imagesValidData, bundled];
}

// Checks whether locations are all valid
export function checkLocationsValid(gameData: GameData): [boolean, any, any] {
    // Ensure that all locations have fields populated
    const locationsValidData: any[] = [];
    for(const [_, locationData] of gameData.data.locations) {
        locationsValidData.push({
            name: locationData.name !== "",
            display: locationData.display !== "",
            image: locationData.image !== "",
        });
    }
    const locationsValid = locationsValidData.map(data => recursiveCheckValid(data));

    const bundled = {
        locations: locationsValid,
    }
    const valid = recursiveCheckValid(bundled);

    return [valid, locationsValidData, bundled];
}

// Necessary for trimming, to prevent references from being orphaned
export function filterInPlace(arr: any[], filterFunc: (val: any) => boolean) {
    let index = 0;
    while(index < arr.length) {
        if(filterFunc(arr[index]) === false) {
            arr.splice(index, 1);
            continue;
        }
        index++;
    }
}
export function getAction(actionID: string, gameData: GameData) {
    return gameData.data.actions.find(([id, _]) => id === actionID);
}
export function getBodyPart(bodyPartID: string, gameData: GameData) {
    return gameData.data.bodyParts.find(([id, _]) => id === bodyPartID);
}
export function getState(stateID: string, gameData: GameData) {
    return gameData.data.states.find(([id, _]) => id === stateID);
}
export function getInteractionNode(nodeID: string, interactionData: GameInteraction) {
    return interactionData.nodes.find(([id, _]) => id === nodeID);
}
export function getObject(objectID: string, gameData: GameData) {
    return gameData.data.objects.find(([id, _]) => id === objectID);
}
export function getRestraint(restraintID: string, gameData: GameData) {
    return gameData.data.restraints.find(([id, _]) => id === restraintID);
}
export function getImage(imageID: string, gameData: GameData) {
    return gameData.data.images.find(([id, _]) => id === imageID);
}
export function getLocation(locationID: string, gameData: GameData) {
    return gameData.data.locations.find(([id, _]) => id === locationID);
}
export function isComponentValid(componentID: string, gameData: GameData) {
    return componentID === "{anything}" 
        || getBodyPart(componentID, gameData) !== undefined
        || getObject(componentID, gameData) !== undefined
        || getRestraint(componentID, gameData) !== undefined;
}
export function areComponentsValid(componentIDs: string[], gameData: GameData) {
    return componentIDs.map(componentID => isComponentValid(componentID, gameData))
        .filter(valid => valid === true).length > 0;
}