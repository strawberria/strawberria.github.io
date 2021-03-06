<script lang="ts">
    import { onMount } from "svelte";
    import FormGrouping from "$lib/FormGrouping.svelte";
    import RuntimeClick from "$lib/RuntimeClick.svelte";
    import type { ProjectData } from "../types";
    import IconButton from "$lib/IconButton.svelte";
    import ParagraphNewline from "./ParagraphNewline.svelte";

    // TODO: somehow pass prop as object instead of string
    export let gameData: ProjectData;

    const initialState = Object.entries(gameData.storage.states.data)
        .filter(([id, data]) => data.type === "starting")[0][0];
    if(initialState === undefined) { throw new Error("/!\\ Couldn't find initial state!")}

    // Canvas-related handlings, TODO implement onclick?
    let canvas: HTMLCanvasElement;
    let canvasWidth: number;
    let canvasHeight: number;
    let context: CanvasRenderingContext2D;
    onMount(() => { context = canvas.getContext("2d") as CanvasRenderingContext2D; });
    
    function handleMinimapClick(event?: MouseEvent) {
        // Ignore if dialog currently showing
        if(event === undefined) { return; }

        // Get absolute coordinates for checking paths
        const boundingRect = canvas.getBoundingClientRect();
        const clickCoordX = event.clientX - boundingRect.left;
        const clickCoordY = event.clientY - boundingRect.top;

        // Iterate over minimap objects, drawing paths and checking if included
        for(const minimapObject of Object.values(gameData.storage.states.data[currentState].minimapObjects.data)) {
            const path = new Path2D();
            if(minimapObject.type === "vector" 
                && minimapObject.args[0] !== undefined && minimapObject.args[1] !== undefined) {
                for(const [pointRatioX, pointRatioY] of minimapObject.args) {
                    const pointCoordX = Math.floor(pointRatioX * boundingRect.width);
                    const pointCoordY = Math.floor(pointRatioY * boundingRect.height);
                    path.lineTo(pointCoordX, pointCoordY);
                }
            } else if(minimapObject.args[1] !== undefined) { // if(minimapObject.type === "circle"
                const [[centerRatioX, centerRatioY], [radiusRatioX, radiusRatioY]] = minimapObject.args;

                const centerCoordX = Math.floor(centerRatioX * boundingRect.width);
                const centerCoordY = Math.floor(centerRatioY * boundingRect.height);
                const radiusCoordX = Math.floor(radiusRatioX * boundingRect.width);
                const radiusCoordY = Math.floor(radiusRatioY * boundingRect.height);
                const radius = Math.sqrt(Math.pow(centerCoordX - radiusCoordX, 2) + Math.pow(centerCoordY - radiusCoordY, 2));
                path.arc(centerCoordX, centerCoordY, radius, 0, 2 * Math.PI);
            }

            // Check whether the click point is within the path
            if(context.isPointInPath(path, clickCoordX, clickCoordY)) {
                // Add object if defined
                if(minimapObject.object !== "") { addFoundObject(minimapObject.object) }
                if(minimapObject.dialog !== "") { showDialog(minimapObject.dialog) }
            }
        }
    }

    // Current runtime state stuff
    let dialogText: string | undefined = undefined; // Show if defined
    let selectedAction: string | undefined = undefined;
    let selectedComponents: string[] = [];
    let currentState: string = initialState;
    let currentRestraints: string[] = Object.values(gameData.data.restraintLocations.data)
        .map(v => v.initial).filter(v => v !== "");
    let foundObjects: string[] = [];
    let flags: { [key: string]: string } = {};
    let attempts = 0;
    
    function restartGame() {
        dialogText = undefined; // Show if defined
        selectedAction = undefined;
        selectedComponents = [];
        currentState = initialState;
        currentRestraints = Object.values(gameData.data.restraintLocations.data)
            .map(v => v.initial).filter(v => v !== "");
        foundObjects = [];
        flags = {};
    }

    let restraintMappings: { [restraintLocationID: string]: [string, string] } = {};
    $: {
        currentRestraints;

        restraintMappings = {};
        for(const restraintID of currentRestraints) {
            const restraintData = gameData.storage.restraints.data[restraintID];
            restraintMappings[restraintData.location] = [restraintData.id, restraintData.name];
        }

        restraintMappings = restraintMappings;
    }

    function addFoundObject(objectID: string) { 
        // Don't add object if already there
        if(foundObjects.findIndex(v => v === objectID) !== -1) { return; }

        foundObjects.push(objectID);
        foundObjects.sort((a, b) => gameData.storage.objects.ordering.findIndex(v => v === a) - gameData.storage.objects.ordering.findIndex(v => v === b));
        foundObjects = foundObjects;
    }
    function removeFoundObject(objectID: string) {
        // Assume that found objects are already sorted
        foundObjects = foundObjects.filter(v => v !== objectID);
    }
    function addRestraint(restraintID: string) { 
        // Don't add restraint if already there
        if(currentRestraints.findIndex(v => v === restraintID) !== -1) { return; }

        currentRestraints.push(restraintID);
        currentRestraints.sort((a, b) => gameData.storage.restraints.ordering.findIndex(v => v === a) - gameData.storage.restraints.ordering.findIndex(v => v === b));
        currentRestraints = currentRestraints;
    }
    function removeRestraint(restraintID: string) {
        // Assume that current restraints are already sorted
        currentRestraints = currentRestraints.filter(v => v !== restraintID);
    }
    function showDialog(newDialogText: string) {
        dialogText = newDialogText;
    }
    function hideDialog() {
        dialogText = undefined;
    }

    function handleActionClick(event: any) {
        // Ignore if dialog currently showing
        if(dialogText !== undefined || event === undefined) { return; }

        const actionID = event.detail.key;
        selectedAction = actionID === selectedAction
            ? undefined : actionID;
    }

    function handleObjectClick(event: any) {
        // Ignore if dialog currently showing or no action selected
        if(dialogText !== undefined || selectedAction === undefined || event === undefined) { return; }

        // Push object ID to selected objects
        const objectID = event.detail.key;
        selectedComponents.push(objectID);
        selectedComponents = selectedComponents;

        const actionData = gameData.data.actions.data[selectedAction];

        // Edge case: examining
        if(selectedAction === "examine" && selectedComponents[0] !== undefined) {
            dialogText = gameData.storage.objects.data[selectedComponents[0]]
                ? gameData.storage.objects.data[selectedComponents[0]].examine
                : gameData.storage.restraints.data[selectedComponents[0]]
                    ? gameData.storage.restraints.data[selectedComponents[0]].examine
                    : undefined;
            selectedAction = undefined;
            selectedComponents = [];
            
            return;
        }

        // Check whether combination matches any interactions and their criteria
        let interactionFound = false;
        let clear = actionData.two === false || selectedComponents.length === 2;
        for(const interactionID of gameData.storage.states.data[currentState].interactions.ordering) {
            // Retrieve interaction data and filter components
            const interactionData = gameData.storage.states.data[currentState].interactions.data[interactionID];

            if(interactionData.action !== selectedAction) { continue; }
            if(interactionData.components[0] !== selectedComponents[0] 
                || (actionData.order === false && interactionData.components[1] !== selectedComponents[0])) { continue; }
            if(interactionData.components[1] !== "" && (interactionData.components[1] !== selectedComponents[1]
                || (actionData.order === false && interactionData.components[0] !== selectedComponents[1]))) { continue; }

            // Iterate through criteria and check whether they are matched
            const criteriasPassed = interactionData.criteria.ordering.map(
                (criteriaID) => {
                    const criteriaData = interactionData.criteria.data[criteriaID];

                    // Check individual criteria
                    let passedCriteria = false;
                    switch(criteriaData.type) {
                        case "flagEquals": {
                            passedCriteria = flags[criteriaData.args[0]] === criteriaData.args[1];
                        } break;
                        case "flagNotEquals": {
                            passedCriteria = flags[criteriaData.args[0]] !== criteriaData.args[1];
                        } break;
                        case "objectFound": {
                            passedCriteria = foundObjects.findIndex(v => v === criteriaData.args[0]) !== -1;
                        } break;
                        case "objectNotFound": {
                            passedCriteria = foundObjects.findIndex(v => v === criteriaData.args[0]) === -1;
                        } break;
                        case "restraintWearing": {
                            passedCriteria = currentRestraints.findIndex(v => v === criteriaData.args[0]) !== -1;
                        } break;
                        case "restraintNotWearing": {
                            passedCriteria = currentRestraints.findIndex(v => v === criteriaData.args[0]) === -1;
                        } break;
                        case "exceededAttempts": {
                            passedCriteria = attempts >= criteriaData.args[0];
                        } break;
                    }

                    return passedCriteria;
                }
            ).every(v => v === true);

            // Check whether all criterias passed
            if(criteriasPassed === false) {
                continue;
            }

            console.log(`Execution interaction "${interactionData.devName}"`);

            // Criteria passed, now execute results
            interactionFound = true;
            clear = true;
            for(const resultID of interactionData.results.ordering) {
                const resultData = interactionData.results.data[resultID];

                // Execute individual results
                switch(resultData.type) {
                    case "setFlag": {
                        flags[resultData.args[0]] = resultData.args[1];
                    } break;
                    case "setState": {
                        currentState = resultData.args[0];
                        attempts = 0;
                    } break;
                    case "popupDialog": {
                        dialogText = resultData.args[0];
                    } break;
                    case "objectReveal": {
                        addFoundObject(resultData.args[0]);
                    } break;
                    case "objectHide": {
                        removeFoundObject(resultData.args[0]);
                    } break;
                    case "restraintAdd": {
                        addRestraint(resultData.args[0]);
                    } break;
                    case "restraintRemove": {
                        removeRestraint(resultData.args[0]);
                    } break;
                }
            }

            // Clear once interaction found
            if(interactionFound === true) {
                selectedAction = undefined;
                selectedComponents = [];
                break;
            }
        }

        // Show "you can't do that" placeholder dialog
        if(interactionFound === false && clear === true) {
            dialogText = "You can't do that!"
            attempts++;
            selectedAction = undefined;
            selectedComponents = [];
        }
    }

    function handleHintClick(event: any) {
        if(event === undefined) { return; }

        const hintIndex = parseInt(event.detail.key);
        dialogText = `Hint: ${gameData.storage.states.data[currentState].hints[hintIndex].text}`;
    }
</script>

<div class="flex flex-row items-stretch space-x-4
	absolute inset-0 p-4
    text-slate-400">
	{#if gameData.storage.states.data[currentState].type === "starting"
        || gameData.storage.states.data[currentState].type === "normal"}
        <FormGrouping class="w-1/4">
            <svelte:fragment slot="content">
                <div class="grow flex flex-col items-start space-y-4">
                    {#if gameData.storage.states.data[currentState].imageB64 !== ""
                        && gameData.storage.states.data[currentState].imageB64 !== undefined}
                        <img class="h-2/3 object-contain w-full" src={gameData.storage.states.data[currentState].imageB64} />
                    {/if}
                    <p class="whitespace-pre-line">{gameData.storage.states.data[currentState].description}</p>
                    <div class="grow" />
                    <div class="flex flex-col space-y-2">
                        {#each { length: 3 } as _, index}
                            {#if attempts >= gameData.storage.states.data[currentState].hints[index].attempts
                                && gameData.storage.states.data[currentState].hints[index].attempts !== -1}
                                <RuntimeClick key={`${index}`}
                                    name={`Hint ${index + 1}`}
                                    highlighted={false}
                                    on:dispatchClick={handleHintClick} />
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
                    <div class="border border-slate-500 
                        minimap-display">
                        {#if gameData.storage.states.data[currentState].minimapB64 !== ""
                            && gameData.storage.states.data[currentState].minimapB64 !== undefined}
                            <img class="absolute h-full w-full object-contain"
                                style="z-index: 12"
                                src={gameData.storage.states.data[currentState].minimapB64} />
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
                    <div class="flex flex-col space-y-1 pb-1.5 pl-2 pr-2">
                        {#each gameData.data.restraintLocations.ordering as restraintLocationID}
                            <div class="flex flex-row justify-between items-end">
                                <RuntimeClick key={gameData.data.restraintLocations.data[restraintLocationID].id}
                                    name={gameData.data.restraintLocations.data[restraintLocationID].name}
                                    highlighted={selectedComponents.findIndex(v => v === gameData.data.restraintLocations.data[restraintLocationID].id) !== -1}
                                    on:dispatchClick={handleObjectClick} />
                                {#if restraintMappings[restraintLocationID] !== undefined}
                                    <RuntimeClick key={restraintMappings[restraintLocationID][0]}
                                        name={gameData.storage.restraints.data[restraintMappings[restraintLocationID][0]].name}
                                        highlighted={selectedComponents.findIndex(v => v === restraintMappings[restraintLocationID][0]) !== -1}
                                        on:dispatchClick={handleObjectClick} />
                                {:else}
                                    <p></p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </FormGrouping>
        </div> 
        <div class="grow flex flex-col h-full space-y-4">
            <FormGrouping>
                <svelte:fragment slot="content">
                    <div class="flex flex-row items-center space-x-6 pl-1 pr-1">
                        <RuntimeClick key={"examine"}
                            name={"Examine"}
                            highlighted={selectedAction === "examine"}
                            on:dispatchClick={handleActionClick} />
                        {#each gameData.data.actions.ordering as actionID}
                            <RuntimeClick key={actionID}
                                name={gameData.data.actions.data[actionID].name}
                                highlighted={selectedAction === actionID}
                                on:dispatchClick={handleActionClick} />
                        {/each}
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <FormGrouping>
                <svelte:fragment slot="header">
                    <p class="text-slate-300 text-xl">Found Objects</p>
                </svelte:fragment>
                <svelte:fragment slot="content">
                    <div class="grid-container pb-1.5">
                        {#each foundObjects as objectID}
                        <div class="flex flex-col items-center justify-center
                            w-full h-full">
                            <RuntimeClick key={objectID}
                                name={gameData.storage.objects.data[objectID].name}
                                highlighted={selectedComponents.findIndex(v => v === objectID) !== -1}
                                on:dispatchClick={handleObjectClick} />
                        </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </FormGrouping>
            <div class="grow flex flex-col items-center justify-center
                h-full">
                {#if dialogText !== undefined}
                    <a class="max-w-lg bg-slate-800 rounded-lg space-y-4
                        p-4 text-center"
                        on:click={hideDialog}>
                        <p class="whitespace-pre-line">{dialogText}</p>
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
                        {#if gameData.storage.states.data[currentState].imageB64 !== ""}
                            <img class="object-contain w-full" src={gameData.storage.states.data[currentState].imageB64} />
                        {/if}
                        <div class="flex flex-col space-y-2 w-full items-center">
                            <ParagraphNewline class="text-slate-400 text-center"
                                text={gameData.storage.states.data[currentState].description} />
                        </div>
                        <p class="text-center font-bold text-slate-300 text-lg">
                            {`${gameData.storage.states.data[currentState].type === "goodEnd" ? "GOOD" : "BAD"} END`}
                        </p>
                        <div class="flex flex-row justify-center">
                            <IconButton label={"Restart"}
                                onclick={restartGame} />
                        </div>
                    </div>
                </svelte:fragment>
            </FormGrouping>
        </div>
    {/if}
</div>

<style>
    :global(html) {
        background-color: rgba(15, 23, 42, 1);
    }

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