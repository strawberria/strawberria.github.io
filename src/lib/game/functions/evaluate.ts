import { get, writable, type Writable } from "svelte/store";
import type { CurrentData } from "$lib/game/functions/typings";
import { lookupStore, progressStore } from "$lib/game/functions/progress";
import { gameStore } from "$lib/development/functions/project";
import type { GameInteraction } from "$lib/global/functions/typings";

// Current action / components clicked data for evaluation
export const currentStore: Writable<CurrentData> = writable([undefined, [undefined, undefined]]);
currentStore.subscribe(currentData => {
    // When current data changes, evaluate whether anything should be done
    const [actionID, [component1ID, component2ID]] = currentData;
    if(actionID === undefined) { return; }
    const lookupData = get(lookupStore);

    // Shortcut for examine first
    if(actionID === "examine") {
        let actionText = "Examine";
        if(component1ID !== undefined) {
            // Examine with dialog and everything
            const component1Data = lookupData.objects[component1ID]
                ?? lookupData.restraints[component1ID];
            actionText += ` ${component1Data.name}`;

            // Reset the current store once examine finished
            currentStore.set([undefined, [undefined, undefined]]);
            progressStore.update(progressData => {
                // Show examine dialog
                progressData.actionText = "";
                progressData.dialog[0] = actionText;
                progressData.dialog[1] = component1Data.examine

                // If not yet revealed, then reveal
                progressData.needReveal = progressData.needReveal
                    .filter(id => id !== component1ID);

                return progressData;
            });
        } else {
            progressStore.update(progressData => {
                progressData.actionText = actionText;
                return progressData;
            });
        }
        return;
    }

    // Update the current action text before proceeding
    const actionData = lookupData.actions[actionID];
    let actionTextChunks = [actionData.name];
    if(component1ID !== undefined) { 
        const component1Data = lookupData.bodyParts[component1ID]
            ?? lookupData.objects[component1ID]
            ?? lookupData.restraints[component1ID];
        actionTextChunks.push(component1Data.name);
    }
    if(actionData.two && component2ID !== undefined) {
        const component2Data = lookupData.bodyParts[component2ID]
            ?? lookupData.objects[component2ID]
            ?? lookupData.restraints[component2ID];
        actionTextChunks.push(actionData.junct, component2Data.name);
    }
    const actionText = actionTextChunks.join(" ");

    // Execute and check whether action has finished and/or interaction has executed
    const executed = checkExecuteInteractions(actionID, component1ID, component2ID, actionText);
    if(executed === true) {
        currentStore.set([undefined, [undefined, undefined]]);
    }
    progressStore.update(progressData => {
        progressData.actionText = executed ? "" : actionText;
        return progressData;
    });
});

// Handle clicks from within the game - watcher reactively acts
export function handleClick(id: string, type: "action" | "component", examinable: boolean = true) {
    const currentData = get(currentStore);
    if(type === "action") {
        // Handle clicking of action
        if(currentData[0] !== id) {
            // Set action if not yet defined
            currentData[0] = id;
        } else {
            // Clear action and the rest of the current data
            currentData[0] = undefined;
            currentData[1][0] = undefined;
            currentData[1][1] = undefined;
            progressStore.update(progressData => {
                progressData.actionText = "";
                return progressData;
            });
        }
    } else if(currentData[0] !== undefined) {
        // If examine and not examinable, then reset
        if(currentData[0] === "examine" && examinable === false) {
            currentData[0] = undefined;
            currentData[1][0] = undefined;
            progressStore.update(progressData => {
                progressData.actionText = "";
                return progressData;
            });
        } else {
            // If action has been clicked, fill the empty spot - allow undoing
            // For actions with 1 arg, currentStore will clear reactively
            for(let index = 0; index < 2; index++) {
                if(currentData[1][index] === undefined) {
                    currentData[1][index] = id;
                    break;
                } else if(currentData[1][index] === id) {
                    currentData[1][index] = undefined;
                } // Otherwise, continue
            }
        }
    }

    currentStore.set(currentData);
}

// Check and execute interactions given the action, component 1, and component 2
// Returns true if action should be reset, false otherwise - this handles dialog
function checkExecuteInteractions(actionID: string, component1ID: string | undefined, 
    component2ID: string | undefined, actionText: string): boolean {
    const gameData = get(gameStore);
    const lookupData = get(lookupStore);
    const progressData = get(progressStore);
    const actionData = lookupData.actions[actionID];
    // If true, then check whether any interactions match - also return this value
    const shouldEvaluate = (actionData.two === false && component1ID !== undefined)
        || (actionData.two === true && component1ID !== undefined && component2ID !== undefined);
    if(shouldEvaluate === false) { 
        return false;
    }

    // Iterate through interactions and check whether any match
    let executed = false;
    const componentIDs = [component1ID, component2ID];
    for(const [interactionID, interactionData] of gameData.data.interactions) {
        // Only execute one matching interaction!
        if(executed === true) { continue; }

        // Check whether state and components match, also evaluate flip for order === false
        let matches = interactionData.states.includes(progressData.state);
        for(let index = 0; index < 2; index++) {
            if(actionData.two === false && index === 1) { continue; }
            matches = matches && actionID === interactionData.action
                && (interactionData.args[index].includes("{anything}")
                    || interactionData.args[index].includes(componentIDs[index] as string)
                    || (actionData.order === false && interactionData.args[Math.abs(index - 1)].includes(componentIDs[index] as string)));
        }

        // Execute the interaction if it matches, and override default dialog
        if(matches === true) {
            executed = true;
            executeInteraction(interactionID, interactionData, componentIDs, actionText);
            progressStore.update(progressData => {
                progressData.attempts = 0;
                return progressData;
            });
        }
    }

    // If not matching any interactions, show the default dialog and return
    if(executed === false) {
        progressStore.update(progressData => {
            progressData.dialog[0] = actionText;
            progressData.dialog[1] = "That doesn't seem to do anything...";
            progressData.attempts++;
            return progressData;
        });
    }

    return shouldEvaluate;
}

// Execute an individual interaction following the fancy node whatever 
function executeInteraction(interactionID: string, interactionData: GameInteraction, 
    componentIDs: (string | undefined)[], actionText: string) {
    const lookupData = get(lookupStore);
    const progressData = get(progressStore);

    // Get the starting node from the interaction nodes
    // While should keep evaluating, advance through the nodes and do stuff
    let currentNodeData = interactionData.nodes
        .filter(([nodeID, nodeData]) => nodeData.start)
        .map(nodeFull => nodeFull[1])[0];
    let finished = false;
    for(let index = 0; index < 100; index++) {
        if(index === 99) { throw new Error(`Infinite loop within interaction: ${interactionID}`) }
        if(finished === true) { break; }
        // If flagged as end node, then finish after
        finished = currentNodeData.end;

        // Determine what type of node this is, and then execute accordingly
        if(currentNodeData.type === "flag_map") {
            // TODO flag map not implemented, skip for now
            throw new Error(`Flag Map not implemented yet within interaction: ${interactionID}`);
        } else if(currentNodeData.type === "criteria_and" || currentNodeData.type === "criteria_or") {
            // Evaluate individual criteria
            const shouldAnd = currentNodeData.type === "criteria_and";
            const criteriaExecs = currentNodeData.criteria.map(([_, criteriaData]) => {
                // Check criteria depending on type
                let criteriaExec = false;
                if(criteriaData.type === "objectFound" || criteriaData.type === "objectNotFound") {
                    criteriaExec = progressData.objects.includes(criteriaData.args[0]);
                } else if(criteriaData.type === "restraintWearing" || criteriaData.type === "restraintNotWearing") {
                    criteriaExec = Object.values(progressData.restraints).includes(criteriaData.args[0]);
                } else if(criteriaData.type === "currentState") {
                    criteriaExec = progressData.state === criteriaData.args[0];
                } else if(criteriaData.type === "objectFoundTag" || criteriaData.type === "objectNotFoundTag") {
                    criteriaExec = progressData.objects
                        .map(objectID => lookupData.objects[objectID])
                        .filter(objectData => objectData.tags
                            .map(tagDataFull => tagDataFull[1].key)
                            .includes(criteriaData.args[0])
                        ).length > 0;
                } else if(criteriaData.type === "restraintWearingTag" || criteriaData.type === "restraintNotWearingTag") {
                    criteriaExec = Object.values(progressData.restraints)
                        .map(restraintID => lookupData.restraints[restraintID])
                        .filter(restraintData => restraintData.tags
                            .map(tagDataFull => tagDataFull[1].key)
                            .includes(criteriaData.args[0])
                        ).length > 0;
                } else if(criteriaData.type === "component1Tag" || criteriaData.type === "component2Tag") {
                    criteriaExec = componentIDs
                        .filter(id => id !== undefined)
                        .map(id => lookupData.bodyParts[id]
                            ?? lookupData.objects[id]
                            ?? lookupData.restraints[id])
                        .filter((componentData: any) => componentData.tags !== undefined)
                        .filter((componentData: any) => componentData.tags
                            .map((tagDataFull: any) => tagDataFull[1].key)
                            .includes(criteriaData.args[0]))
                        .length > 0;
                } else if(criteriaData.type === "flagEquals" || criteriaData.type === "flagNotEquals") {
                    criteriaExec = `${progressData.flags[criteriaData.args[0]]}`
                        === `${criteriaData.args[1]}`;
                }

                // For any criteria types including "not", inverse the result
                if(criteriaData.type.includes("Not")) {
                    criteriaExec = !criteriaExec;
                }

                return criteriaExec;
            });

            // Evaluate and/or and then determine next node
            const passes = criteriaExecs.some(v => v === !shouldAnd) === !shouldAnd;
            const nextNodeID = passes ? currentNodeData.nextPass : currentNodeData.nextFail;
            currentNodeData = lookupData.nodes[interactionID][nextNodeID];
        } else if(currentNodeData.type === "execute") {
            // Iterate over nodes and execute in-order
            for(const [_, resultData] of currentNodeData.results) {
                // Evaluate results depending on type
                if(resultData.type === "objectAdd" && progressData.objects.includes(resultData.args[0]) === false) {
                    progressData.objects.push(resultData.args[0]);
                } else if(resultData.type === "objectRemove") {
                    progressData.objects = progressData.objects.filter(id => id !== resultData.args[0]);
                } else if(resultData.type === "restraintAdd") {
                    const restraintData = lookupData.restraints[resultData.args[0]];
                    progressData.restraints[restraintData.bodyPart] = resultData.args[0];
                } else if(resultData.type === "restraintRemove") {
                    const restraintData = lookupData.restraints[resultData.args[0]];
                    if(progressData.restraints[restraintData.bodyPart] === resultData.args[0]) {
                        delete progressData.restraints[restraintData.bodyPart];
                    }
                } else if(resultData.type === "locationAdd" && progressData.location.includes(resultData.args[0]) === false) {
                    progressData.locations.push(resultData.args[0]);
                } else if(resultData.type === "locationUpdate") {
                    progressData.locations = progressData.locations.filter(id => id !== resultData.args[0]);
                    if(progressData.locations.includes(resultData.args[1]) === false) {
                        progressData.locations.push(resultData.args[1]);
                    }
                    // Update current location if currently selected
                    if(progressData.location === resultData.args[0]) {
                        progressData.location = resultData.args[1];   
                    }
                } else if(resultData.type === "locationRemove") {
                    progressData.locations = progressData.locations.filter(id => id !== resultData.args[0]);
                } else if(resultData.type === "stateSet") {
                    progressData.state = resultData.args[0];
                } else if(resultData.type === "dialogShow") {
                    progressData.dialog[0] = actionText;
                    progressData.dialog[1] = resultData.args[0];
                } else if(resultData.type === "flagSet") {
                    progressData.flags[resultData.args[0]] = resultData.args[1];
                }
            }
        }
    }

    progressStore.set(progressData);
}