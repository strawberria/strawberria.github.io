<script lang="ts">
    import { writable } from "svelte/store";
    import FormGrouping from "./FormGrouping.svelte";
    import IconButton from "./IconButton.svelte";
    import ParagraphNewline from "./ParagraphNewline.svelte";
    import RuntimeClick from "./RuntimeClick.svelte";
    import type { ProjectActionData, ProjectData, ProjectInteractionData } from "../types";

    export let gameData: ProjectData;
    // import { ProjectData } from "./miscellaneous";
    // export const gameData: ProjectData;

    console.log("[RUN] Performing initialization...");

    // Find and set initial state - reset here when restarting
    const openingStateID = Object.entries(gameData.storage.states.data)
        .filter(([id, data]) => data.type === "opening")[0][0];
    const startingStateID = Object.entries(gameData.storage.states.data)
        .filter(([id, data]) => data.type === "starting")[0][0];

    const openingStateData = gameData.storage.states.data[openingStateID];
    const startingStateData = gameData.storage.states.data[startingStateID];
    console.log(`[RUN] Found opening state: [${openingStateID} - ${openingStateData.title}]`);
    console.log(`[RUN] Found starting state: [${startingStateID} - ${startingStateData.title}]`);

    // Find and set initial minimap location and restraints - reset here when restarting
    let initialMinimapLocation: string = "";
    let initialAvailableLocations: string[] = [];
    for(const minimapLocationID of gameData.storage.states.data[startingStateID].locations.ordering) {
        const minimapLocationData = gameData.storage.states.data[startingStateID].locations.data[minimapLocationID];
        if(minimapLocationData.initial === true) {
            initialAvailableLocations.push(minimapLocationID);
            if(initialMinimapLocation === "") {
                initialMinimapLocation = minimapLocationID;
            }
        }
    }
    const initialRestraintIDs = gameData.data.restraintLocations.ordering
        .map(id => gameData.data.restraintLocations.data[id])
        .map(v => v.initial).filter(v => v !== "");
    for(const initialRestraintID of initialRestraintIDs) {
        const initialRestraintData = gameData.storage.restraints.data[initialRestraintID];
        const restraintLocationData = gameData.data.restraintLocations.data[initialRestraintData.location];
        console.log(`[RUN] Found initial restraint: [${initialRestraintID} - ${initialRestraintData.devName}] @ [${restraintLocationData.id} - ${restraintLocationData.name}]`);
    }

    // Canvas-related declarations
    let canvas: HTMLCanvasElement;
    let canvasContext: CanvasRenderingContext2D;
    let canvasWidth: number; let canvasHeight: number;
    $: { // Retrieve canvas context whenever changed
        canvas;
        if(canvas) { // canvas !== undefined && canvas !== null
            canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
        }
    }

    // Current runtime - store within singular object for future saving/loading
    const initialRuntimeData = {
        dialogText: undefined                                as string | undefined,
        selectedActionID: undefined                          as string | undefined,
        selectedComponentIDs: ["", ""]                       as string[],
        currentStateID: openingStateID                       as string,
        currentMinimapLocationID: initialMinimapLocation     as string,
        availableMinimapLocations: initialAvailableLocations as string[],
        currentRestraintIDs: initialRestraintIDs             as string[],
        revealedObjectIDs: []                                as string[],
        currentAttempts: 0                                   as number,
        seenInteractables: new Set()                         as Set<string>,    
        flags: {}                                            as { [key: string]: string },
    };
    const runtimeStore = writable<typeof initialRuntimeData>(JSON.parse(JSON.stringify(initialRuntimeData)));
    $runtimeStore = initialRuntimeData; // Parsing causes issues?

    (window as any)["gameData"] = gameData;
    (window as any)["runtimeStore"] = $runtimeStore;

    // Restarts game by resetting all data to runtime initial
    function restartGame() {
        $runtimeStore = initialRuntimeData;
    }

    // Start game by advancing state from opening to starting
    function startAdvanceOpening() {
        const statesData = Object.entries(gameData.storage.states.data);
        const currentOpeningIndex = statesData.findIndex(v => v[0] === $runtimeStore.currentStateID);
        const nextStateData = statesData[currentOpeningIndex+1][1];
        if(nextStateData !== undefined && nextStateData.type === "intermediate") {
            // Advance to next intermediate scene?
            $runtimeStore.currentStateID = nextStateData.id;
        } else {
            $runtimeStore.currentStateID = Object.entries(gameData.storage.states.data)
                .filter(([id, data]) => data.type === "starting")[0][0];    
        }
    }

    // Map restraints from list of IDs to location-id/name mappings for ease of access
    let restraintMappings: { [restraintLocationID: string]: [string, string] } = {};
    $: {
        $runtimeStore.currentRestraintIDs;
        
        restraintMappings = {};
        for(const restraintID of $runtimeStore.currentRestraintIDs) {
            const restraintData = gameData.storage.restraints.data[restraintID];
            restraintMappings[restraintData.location] = [restraintData.id, restraintData.name];
        }

        restraintMappings = restraintMappings;
    }

    // Fires whenever minimap canvas is clicked
    function handleMinimapClick(event?: MouseEvent) {
        // Don't ignore if dialog is currently showing
        if(event === undefined) { return; }

        // Get absolute coordinates for checking click target
        const boundingRect = canvas.getBoundingClientRect();
        const clickCoordX = event.clientX - boundingRect.left;
        const clickCoordY = event.clientY - boundingRect.top;

        // Iterate over minimap objects, drawing paths and checking inclusion
        for(const minimapObjectData of gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[$runtimeStore.currentMinimapLocationID].minimapObjects.ordering
            .map(id => gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[$runtimeStore.currentMinimapLocationID].minimapObjects.data[id])) {
            const path = new Path2D();
            if(minimapObjectData.type === "vector" 
                && minimapObjectData.args[0] !== undefined && minimapObjectData.args[1] !== undefined) {
                for(const [pointRatioX, pointRatioY] of minimapObjectData.args) {
                    const pointCoordX = Math.floor(pointRatioX * boundingRect.width);
                    const pointCoordY = Math.floor(pointRatioY * boundingRect.height);
                    path.lineTo(pointCoordX, pointCoordY);
                }
            } else if(minimapObjectData.args[1] !== undefined) { // if(minimapObject.type === "circle"
                const [[centerRatioX, centerRatioY], [radiusRatioX, radiusRatioY]] = minimapObjectData.args;

                const centerCoordX = Math.floor(centerRatioX * boundingRect.width);
                const centerCoordY = Math.floor(centerRatioY * boundingRect.height);
                const radiusCoordX = Math.floor(radiusRatioX * boundingRect.width);
                const radiusCoordY = Math.floor(radiusRatioY * boundingRect.height);
                const radius = Math.sqrt(Math.pow(centerCoordX - radiusCoordX, 2) + Math.pow(centerCoordY - radiusCoordY, 2));
                path.arc(centerCoordX, centerCoordY, radius, 0, 2 * Math.PI);
            }

            // Check whether the click point is within the path
            if(canvasContext.isPointInPath(path, clickCoordX, clickCoordY)) {
                // Add object if defined
                if(minimapObjectData.object !== "") { addFoundObject(minimapObjectData.object) }
                if(minimapObjectData.dialog !== "") { showDialog(minimapObjectData.dialog) }

                // Only handle first clicked
                return;
            }
        }
    }

    function addFoundObject(objectID: string) { 
        // Don't add object if already there
        const objectData = gameData.storage.objects.data[objectID];
        if($runtimeStore.revealedObjectIDs.findIndex(v => v === objectID) !== -1) { return; }

        $runtimeStore.revealedObjectIDs.push(objectID);
        $runtimeStore.revealedObjectIDs.sort((a, b) => gameData.storage.objects.ordering.findIndex(v => v === a) - gameData.storage.objects.ordering.findIndex(v => v === b));
        $runtimeStore.revealedObjectIDs = $runtimeStore.revealedObjectIDs;
    }
    function hideObject(objectID: string) {
        // Assume that found objects are already sorted
        const objectData = gameData.storage.objects.data[objectID];
        $runtimeStore.revealedObjectIDs = $runtimeStore.revealedObjectIDs.filter(v => v !== objectID);
    }
    function addRestraint(restraintID: string) { 
        // Don't add restraint if already there
        const restraintData = gameData.storage.restraints.data[restraintID];
        if($runtimeStore.currentRestraintIDs.findIndex(v => v === restraintID) !== -1) { 
            return; 
        }

        $runtimeStore.currentRestraintIDs.push(restraintID);
        $runtimeStore.currentRestraintIDs.sort((a, b) => gameData.storage.restraints.ordering.findIndex(v => v === a) - gameData.storage.restraints.ordering.findIndex(v => v === b));
        $runtimeStore.currentRestraintIDs = $runtimeStore.currentRestraintIDs;
    }
    function removeRestraint(restraintID: string) {
        // Assume that current restraints are already sorted
        const restraintData = gameData.storage.restraints.data[restraintID];
        $runtimeStore.currentRestraintIDs = $runtimeStore.currentRestraintIDs.filter(v => v !== restraintID);
    }
    function addLocation(locationID: string) {
        const locationData = gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[locationID];
        if($runtimeStore.availableMinimapLocations.findIndex(v => v === locationID) !== -1) {
            return; 
        }

        $runtimeStore.availableMinimapLocations.push(locationID);
        $runtimeStore.availableMinimapLocations = $runtimeStore.availableMinimapLocations;

        // Swap to new location, some might not like?
        $runtimeStore.currentMinimapLocationID = locationID;
    }
    function removeLocation(locationID: string) {
        const locationData = gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[locationID];
        $runtimeStore.availableMinimapLocations = $runtimeStore.availableMinimapLocations.filter(v => v !== locationID);

        // Move player back to first available location if current location changed
        if($runtimeStore.currentMinimapLocationID === locationID) {
            $runtimeStore.currentMinimapLocationID = gameData.storage.states.data[$runtimeStore.currentStateID].locations.ordering
                .filter(v => $runtimeStore.availableMinimapLocations.includes(v))[0];
        }
    }
    function showDialog(newDialogText: string) {
        // Only add to queue if not already shown
        $runtimeStore.dialogText = newDialogText
    }
    function hideDialog() {
        $runtimeStore.dialogText = undefined;
    }
    function resetAttempts() {
        $runtimeStore.currentAttempts = 0;
    }

    // // Backup runtime data for undoing
    // function backupRuntimeData() {
    //     console.log(`[RUN] backupRuntimeData - backing-up data for later undoing`);

    //     // Parse and stringify to perform deep copy of underlying
    //     $backupRuntimesStore.push(JSON.parse(JSON.stringify($runtimeStore)));
    //     $backupRuntimesStore = $backupRuntimesStore; // Necessary?
    // }
    // Restore runtime data from backup runtime store
    // function restoreRuntimeData() {
    //     // Immediately return if no backup found (shouldn't happen)
    //     if($backupRuntimesStore.length === 0) { return; }

    //     console.log(`[RUN] restoreRuntimeData - undoing and restoring runtime data from backup`);
    //     $runtimeStore = $backupRuntimesStore.pop();
    //     $backupRuntimesStore = $backupRuntimesStore; // Necessary?

    //     // Clear dialog text and selected for runtime data
    //     $runtimeStore.dialogText = undefined;
    //     $runtimeStore.selectedActionID = undefined;
    //     $runtimeStore.selectedComponentIDs = ["", ""];
    //     // $runtimeStore.currentAttempts = 0;
    // }

    // Fires whenever action is clicked
    function handleActionClick(event: any) {
        if(event === undefined) { return; }

        // Clear event and components if deselected
        const actionID = event.detail.key;
        if($runtimeStore.selectedActionID === actionID) {
            $runtimeStore.selectedActionID = undefined;
            return;
        }

        // Else, clear components and handle depending on which action clicked
        $runtimeStore.selectedComponentIDs = ["", ""];
        if(actionID !== "examine") {
            const actionData = gameData.data.actions.data[actionID];
            console.log(`[RUN] handleActionClick - [${actionID} - ${actionData.name}]`);
        } else {
            console.log(`[RUN] handleActionClick - [examine]`);
        }

        $runtimeStore.selectedActionID = actionID === $runtimeStore.selectedActionID
            ? undefined : actionID;
    }

    // Checks whether the passed interaction has all components and criteria met
    function checkInteractionCriteria(actionData: ProjectActionData, interactionData: ProjectInteractionData, checkAttempts: boolean): boolean {
        // Immediately return if checkAttempts doesn't match existence of exceededAttempts criteria
        if(checkAttempts !== Object.values(interactionData.criteria.data)
            .filter(criteriaData => criteriaData.type === "exceededAttempts")
            .length > 0) { return false; }

        // console.log(`[RUN] checkInteractionCriteria - comparing (${interactionData.action} / ${$runtimeStore.selectedActionID} @ order, two = ${actionData.order}, ${actionData.two}) 0 = [${interactionData.components[0]} / ${$runtimeStore.selectedComponentIDs[0]}] 1 = [${interactionData.components[1]} / ${$runtimeStore.selectedComponentIDs[1]}]`);

        // Check whether actions and components match (including toggles)
        if(checkAttempts === false) {
            if(interactionData.action !== $runtimeStore.selectedActionID) { return false; }
            if(interactionData.components[0] !== $runtimeStore.selectedComponentIDs[0]) {
                // If order matters, immediately return doesn't match
                if(actionData.order === true) { return false; }
                if(interactionData.components[1] !== $runtimeStore.selectedComponentIDs[0]) { return false; }
            }
            if(interactionData.components[1] !== $runtimeStore.selectedComponentIDs[1]) {
                // If order matters, immediately return doesn't match
                if(actionData.order === true) { return false; }
                if(interactionData.components[0] !== $runtimeStore.selectedComponentIDs[1]) { return false; }
            }
        }

        // Iterate through criteria and check whether they are matched
        const criteriasPassed = interactionData.criteria.ordering.map(
            (criteriaID) => {
                const criteriaData = interactionData.criteria.data[criteriaID];

                // Check individual criteria
                let passedCriteria = false;
                switch(criteriaData.type) {
                    case "flagEquals": {
                        passedCriteria = $runtimeStore.flags[criteriaData.args[0]] === criteriaData.args[1];
                    } break;
                    case "flagNotEquals": {
                        passedCriteria = $runtimeStore.flags[criteriaData.args[0]] !== criteriaData.args[1];
                    } break;
                    case "objectFound": {
                        passedCriteria = $runtimeStore.revealedObjectIDs.findIndex(v => v === criteriaData.args[0]) !== -1;
                    } break;
                    case "objectNotFound": {
                        passedCriteria = $runtimeStore.revealedObjectIDs.findIndex(v => v === criteriaData.args[0]) === -1;
                    } break;
                    case "restraintWearing": {
                        passedCriteria = $runtimeStore.currentRestraintIDs.findIndex(v => v === criteriaData.args[0]) !== -1;
                    } break;
                    case "restraintNotWearing": {
                        passedCriteria = $runtimeStore.currentRestraintIDs.findIndex(v => v === criteriaData.args[0]) === -1;
                    } break;
                    case "exceededAttempts": {
                        passedCriteria = checkAttempts && $runtimeStore.currentAttempts >= criteriaData.args[0];
                        console.log(`exceededAttempts check: ${passedCriteria}`)
                    } break;
                }

                return passedCriteria;
            }
        ).every(v => v === true);

        if(checkAttempts === true) {
            console.log(criteriasPassed)
        }

        return criteriasPassed;
    }

    // Executes interaction with given interaction data
    function executeInteraction(interactionData: ProjectInteractionData) {
        for(const resultID of interactionData.results.ordering) {
            const resultData = interactionData.results.data[resultID];

            // Execute individual results
            switch(resultData.type) {
                case "setFlag": {
                    $runtimeStore.flags[resultData.args[0]] = resultData.args[1];
                } break;
                case "setState": {
                    // Reset number of attempts whenever state changed
                    $runtimeStore.currentStateID = resultData.args[0];
                    $runtimeStore.currentAttempts = 0;

                    // Reset minimap location if current isn't available anymore
                    if(gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[$runtimeStore.currentMinimapLocationID] === undefined) {
                        $runtimeStore.currentMinimapLocationID = gameData.storage.states.data[$runtimeStore.currentStateID].locations.ordering[0]
                    }
                } break;
                case "popupDialog": {
                    showDialog(resultData.args[0]);
                } break;
                case "objectReveal": {
                    addFoundObject(resultData.args[0]);
                } break;
                case "objectHide": {
                    hideObject(resultData.args[0]);
                } break;
                case "restraintAdd": {
                    addRestraint(resultData.args[0]);
                } break;
                case "restraintRemove": {
                    removeRestraint(resultData.args[0]);
                } break;
                case "locationAdd": {
                    addLocation(resultData.args[0]);
                } break;
                case "locationRemove": {
                    removeLocation(resultData.args[0]);
                } break;
                case "resetAttempts": {
                    resetAttempts();
                }
            }
        }
    }

    // Fires whenever object is clicked, executes if action is selected
    function handleObjectClick(event: any) {
        // Ignore if no action selected
        if($runtimeStore.selectedActionID === undefined || event === undefined) { return; }

        // Remove if already highlighted 
        const objectID = event.detail.key;
        // const existingIndex = $runtimeStore.selectedComponentIDs.indexOf(objectID);
        // if(existingIndex !== -1) { // Can only be zero
        //     $runtimeStore.selectedComponentIDs[0] = "";
        //     return;
        // }

        // Push object ID to selected objects
        $runtimeStore.selectedComponentIDs[$runtimeStore.selectedComponentIDs[0] === "" ? 0 : 1] = objectID;
        $runtimeStore.selectedComponentIDs = $runtimeStore.selectedComponentIDs;


        const actionData = gameData.data.actions.data[$runtimeStore.selectedActionID];

        // Edge case: handle examining separately, ignore any examines regarding restraint location
        if($runtimeStore.selectedActionID === "examine" && $runtimeStore.selectedComponentIDs[0] !== undefined) {
            // Disallow examining restraint locations, just examine the restraints insteacd
            if(gameData.data.restraintLocations.ordering.includes($runtimeStore.selectedComponentIDs[0]) === false) {
                const examineText: string | undefined = gameData.storage.objects.data[$runtimeStore.selectedComponentIDs[0]]
                    ? gameData.storage.objects.data[$runtimeStore.selectedComponentIDs[0]].examine
                    : gameData.storage.restraints.data[$runtimeStore.selectedComponentIDs[0]]
                        ? gameData.storage.restraints.data[$runtimeStore.selectedComponentIDs[0]].examine
                        : undefined;

                if(examineText !== undefined) {
                    showDialog(examineText);
                }
            }

            $runtimeStore.selectedActionID = undefined;
            $runtimeStore.selectedComponentIDs = ["", ""];
            
            return;
        }

        // Check whether combination matches any interactions and their criteria
        let interactionFound = false;
        let clear = actionData.two === false || ($runtimeStore.selectedComponentIDs[0] !== "" && $runtimeStore.selectedComponentIDs[1] !== "");
        for(const interactionID of gameData.storage.states.data[$runtimeStore.currentStateID].interactions.ordering) {
            // Retrieve interaction data and filter action and components
            const interactionData = gameData.storage.states.data[$runtimeStore.currentStateID].interactions.data[interactionID];
            const criteriasPassed = checkInteractionCriteria(actionData, interactionData, false);
            if(criteriasPassed === false) {
                continue;
            }

            // Criteria(s) passed, backup then execute results
            interactionFound = true;
            clear = true;
            executeInteraction(interactionData);

            // Clear once interaction found
            if(interactionFound === true) {
                $runtimeStore.selectedActionID = undefined;
                $runtimeStore.selectedComponentIDs = ["", ""];
                break;
            }
        }

        if(interactionFound === false) {
            console.log(`[RUN] handleObjectClick - found no interactions matching all criteria`);
        }

        // Show "you can't do that" placeholder dialog
        if(interactionFound === false && clear === true) {
            // Increment current attempts
            $runtimeStore.currentAttempts++;
            for(const interactionID of gameData.storage.states.data[$runtimeStore.currentStateID].interactions.ordering) {
                // Check whether any interactions with current attempts should be executed
                const interactionData = gameData.storage.states.data[$runtimeStore.currentStateID].interactions.data[interactionID];
                const criteriasPassed = checkInteractionCriteria(actionData, interactionData, true);
                if(criteriasPassed === false) {
                    continue;
                }
                console.log(`[RUN] handleObjectClick - criteria(s) passed (attempts = true), executing interaction [${interactionID} - ${interactionData.devName}]`);

                // Criteria(s) passed, now execute results
                executeInteraction(interactionData);

                break;
            }

            console.log(`[RUN] handleObjectClick - clearing since no interaction found`);

            // Only add dialog if not already there
            $runtimeStore.dialogText = "You can't do that!"
            $runtimeStore.selectedActionID = undefined;
            $runtimeStore.selectedComponentIDs = ["", ""];
        }
    }

    // Displays hint whenever hint clicked
    function handleHintClick(event: any) {
        if(event === undefined) { return; }

        const hintIndex = parseInt(event.detail.key);
        const hintText = `Hint: ${gameData.storage.states.data[$runtimeStore.currentStateID].hints[hintIndex].text}`;

        console.log(`[RUN] handleHintClick - displaying hint text (as dialog) [${hintIndex} - ${hintText}]`);

        $runtimeStore.dialogText = hintText;
    }

    // Un-shadows after hover
    function handleHoverSeen(event: any) {
        if(event === undefined) { return; }

        const hoverID = event.detail.key;
        $runtimeStore.seenInteractables.add(hoverID);
        $runtimeStore.seenInteractables = $runtimeStore.seenInteractables;
    }

    let actionName: string | undefined = undefined;
    let actionVerb: string | undefined = undefined;
    let componentName: string | undefined = undefined;
    runtimeStore.subscribe(v => {
        if(v.selectedActionID === "examine") {
            actionName = "Examine";
        } else if(v.selectedActionID !== undefined) {
            const actionData = gameData.data.actions.data[v.selectedActionID];
            actionName = actionData !== undefined ? actionData.name : undefined;
            actionVerb = actionData !== undefined ? actionData.verb : undefined;
        }

        const restraintData = gameData.storage.restraints.data[v.selectedComponentIDs[0]];
        if(restraintData !== undefined) { componentName = restraintData.name; return; }
        const objectData = gameData.storage.objects.data[v.selectedComponentIDs[0]];
        if(objectData !== undefined) { componentName = objectData.name; return; }
        const locationData = gameData.data.restraintLocations.data[v.selectedComponentIDs[0]];
        if(locationData !== undefined) { componentName = locationData.name; return; }
        componentName = undefined;
    })
</script>

<div class="flex flex-row items-stretch space-x-4
	grow min-h-0 p-4
    text-slate-400">
	{#if gameData.storage.states.data[$runtimeStore.currentStateID].type === "starting"
        || gameData.storage.states.data[$runtimeStore.currentStateID].type === "normal"}
        <FormGrouping class="w-1/4 h-full">
            <svelte:fragment slot="content">
                <div class="h-full flex flex-col items-start">
                    <div class="flex flex-col w-full space-y-4 items-center">
                        {#if gameData.storage.states.data[$runtimeStore.currentStateID].imageHash !== ""}
                            <img class="object-contain w-4/5" src={gameData.storage.images[gameData.storage.states.data[$runtimeStore.currentStateID].imageHash]} />
                        {/if}
                        <ParagraphNewline class="w-full"
                            text={gameData.storage.states.data[$runtimeStore.currentStateID].description} />
                    </div>
                    <div class="grow" />
                    <div class="flex flex-col space-y-2">
                        {#each { length: 3 } as _, index}
                            {#if $runtimeStore.currentAttempts >= gameData.storage.states.data[$runtimeStore.currentStateID].hints[index].attempts
                                && gameData.storage.states.data[$runtimeStore.currentStateID].hints[index].attempts !== -1}
                                <RuntimeClick key={`${index}`}
                                    name={`Hint ${index + 1}`}
                                    highlighted={false}
                                    seen={true}
                                    on:dispatchClick={handleHintClick} />
                            {:else} 
                                <!-- Placeholderr RuntimeClick -->
                                <div class="h-6" />
                            {/if}
                        {/each}
                    </div>
                </div>
            </svelte:fragment>
        </FormGrouping>
        <div class="flex flex-col space-y-4 
            h-full" style="width: 30%">
            <FormGrouping>
                <svelte:fragment slot="content">
                    <div class="border border-slate-600 
                        minimap-display">
                        {#if gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[$runtimeStore.currentMinimapLocationID].minimapHash !== ""}
                            <img class="absolute h-full w-full object-contain"
                                style="z-index: 12"
                                src={gameData.storage.images[gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[$runtimeStore.currentMinimapLocationID].minimapHash]} />
                            <canvas class="absolute h-full w-full"
                                style="z-index: 14"
                                bind:this={canvas}
                                bind:clientWidth={canvasWidth}
                                bind:clientHeight={canvasHeight}
                                width={canvasWidth}
                                height={canvasHeight}
                                on:click={handleMinimapClick} />
                        {/if}
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <FormGrouping>
                <svelte:fragment slot="content">
                    <div class="flex flex-row justify-between items-center">
                        <p class={`h-6 text-slate-400`}>Change Location</p>
                        <select class={`rounded border border-slate-600 placeholder-slate-500 focus:outline-none focus:border-slate-600
                                text-slate-300 bg-slate-800
                                block w-1/2 pl-2 pr-2 pt-1 pb-1`}
                            bind:value={$runtimeStore.currentMinimapLocationID}>
                            {#each gameData.storage.states.data[$runtimeStore.currentStateID].locations.ordering
                                .map(id => gameData.storage.states.data[$runtimeStore.currentStateID].locations.data[id]) as minimapLocationData}
                                {#if $runtimeStore.availableMinimapLocations.includes(minimapLocationData.id)}
                                    <option class="text-slate-300"
                                        value={minimapLocationData.id}>
                                        {minimapLocationData.name}
                                    </option>
                                {/if}
                            {/each}
                        </select>
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <FormGrouping class="grow min-h-0"
                contentClass="scrollbar-thin scrollbar-thumb-slate-600 hover:scrollbar-thumb-rounded overflow-x-hidden">
                <svelte:fragment slot="content">
                    <div class="flex flex-col space-y-2 pl-2 pr-2 mr-2">
                        {#each gameData.data.restraintLocations.ordering as restraintLocationID}
                            <div class="flex flex-row justify-between items-end">
                                <RuntimeClick key={gameData.data.restraintLocations.data[restraintLocationID].id}
                                    name={gameData.data.restraintLocations.data[restraintLocationID].name}
                                    highlighted={$runtimeStore.selectedComponentIDs.findIndex(v => v === gameData.data.restraintLocations.data[restraintLocationID].id) !== -1}
                                    seen={true}
                                    on:dispatchClick={handleObjectClick} />
                                {#if restraintMappings[restraintLocationID] !== undefined}
                                    <RuntimeClick key={restraintMappings[restraintLocationID][0]}
                                        name={gameData.storage.restraints.data[restraintMappings[restraintLocationID][0]].name}
                                        highlighted={$runtimeStore.selectedComponentIDs.findIndex(v => v === restraintMappings[restraintLocationID][0]) !== -1}
                                        seen={$runtimeStore.seenInteractables.has(gameData.storage.restraints.data[restraintMappings[restraintLocationID][0]].id)}
                                        on:dispatchClick={handleObjectClick}
                                        on:dispatchEnter={handleHoverSeen} />
                                {:else}
                                    <p></p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <!-- <div class="grow flex flex-col items-center
                w-full">
                {#if $backupRuntimesStore.length > 0}
                    <IconButton label={"Undo"}
                        onclick={restoreRuntimeData}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                        </svg>
                    </IconButton>
                {/if}
            </div> -->
        </div> 
        <div class="grow flex flex-col h-full space-y-4">
            <FormGrouping>
                <svelte:fragment slot="content">
                    <div class="flex flex-col space-y-2 items-start pl-1 pr-1 mb-1">
                        <div class="flex flex-row items-center space-x-6 w-full">
                            <RuntimeClick key={"examine"}
                                name={"Examine"}
                                highlighted={$runtimeStore.selectedActionID === "examine"}
                                seen={true}
                                on:dispatchClick={handleActionClick} />
                            {#each gameData.data.actions.ordering as actionID}
                                <RuntimeClick key={actionID}
                                    name={gameData.data.actions.data[actionID].name}
                                    highlighted={$runtimeStore.selectedActionID === actionID}
                                    seen={true}
                                    on:dispatchClick={handleActionClick} />
                            {/each}
                        </div>
                        <p class="text-l text-slate-400 h-4"
                            style="text-shadow: 0px 0px 5px #2f2b8a">
                            {#if actionName !== undefined}
                                {#if componentName !== undefined}
                                    {actionName} [{componentName}] {actionVerb}
                                {:else}
                                    {actionName}
                                {/if}
                            {/if}
                        </p>
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <FormGrouping>
                <svelte:fragment slot="header">
                    <p class="text-slate-300 text-xl">Found Objects</p>
                </svelte:fragment>
                <svelte:fragment slot="content">
                    <div class="grid-container pb-1.5 gap-1">
                        {#each $runtimeStore.revealedObjectIDs as objectID}
                            <div class="flex flex-col items-center justify-center
                                w-full h-full">
                                <RuntimeClick key={objectID}
                                    name={gameData.storage.objects.data[objectID].name}
                                    highlighted={$runtimeStore.selectedComponentIDs.findIndex(v => v === objectID) !== -1}
                                    seen={$runtimeStore.seenInteractables.has(gameData.storage.objects.data[objectID].id)}
                                    on:dispatchClick={handleObjectClick}
                                    on:dispatchEnter={handleHoverSeen} />
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <div class="grow flex flex-col items-center justify-center
                h-full">
                {#if $runtimeStore.dialogText !== undefined}
                    <a class="max-w-lg bg-slate-800 rounded-lg space-y-4
                        p-4 text-center"
                        on:click={hideDialog}>
                        <ParagraphNewline text={$runtimeStore.dialogText} />
                        <p class="text-sm text-slate-500">[ click to close dialog ]</p>
                    </a>
                {/if}
            </div>
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center space-x-2
            w-full">
            <FormGrouping class="w-1/2">
                <svelte:fragment slot="content">
                    <div class="flex flex-col space-y-4
                        w-full h-full">
                        {#if gameData.storage.states.data[$runtimeStore.currentStateID].imageHash !== ""}
                            <img class="object-contain w-full" src={gameData.storage.images[gameData.storage.states.data[$runtimeStore.currentStateID].imageHash]} />
                        {/if}
                        <div class="flex flex-col space-y-2 w-full items-center">
                            <ParagraphNewline class="text-slate-400 text-center"
                                text={gameData.storage.states.data[$runtimeStore.currentStateID].description} />
                        </div>
                        {#if gameData.storage.states.data[$runtimeStore.currentStateID].type === "ending"}
                            <p class="text-center font-bold text-slate-300 text-lg">
                                {gameData.storage.states.data[$runtimeStore.currentStateID].args[0]}
                            </p>
                        {/if}
                        <div class="flex flex-row justify-center">
                            {#if gameData.storage.states.data[$runtimeStore.currentStateID].type === "opening"
                                || gameData.storage.states.data[$runtimeStore.currentStateID].type === "intermediate"}
                                <IconButton label={"Start"}
                                    onclick={startAdvanceOpening} />
                            {:else}
                                <IconButton label={"Restart"}
                                    onclick={restartGame} />
                            {/if}
                        </div>
                    </div>
                </svelte:fragment>
            </FormGrouping>
        </div>
    {/if}
</div>

<style>
    .minimap-display {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 100%;
    }

    .grid-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 2em;
        gap: 1em;
    }
</style>