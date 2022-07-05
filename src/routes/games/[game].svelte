<script lang="ts">
    import { onMount } from "svelte";
    import FormGrouping from "$lib/FormGrouping.svelte";
    import RuntimeClick from "$lib/RuntimeClick.svelte";
    import type { ProjectData } from "../../types";

    // TODO: somehow pass prop as object instead of string
    export let rawGameData: string;
    const gameData: ProjectData = JSON.parse(rawGameData);

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
        if(dialogText !== undefined || event === undefined) { return; }

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
    let currentRestraints: string[] = [];
    let foundObjects: string[] = [];
    let flags: { [key: string]: string } = {};

    let restraintMappings: { [restraintLocationID: string]: string } = {};
    $: {
        currentRestraints;
        for(const restraintID of currentRestraints) {
            const restraintData = gameData.storage.restraints.data[restraintID];
            restraintMappings[restraintData.location] = restraintData.name;
        }
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

        // Check whether combination matches any interactions and their criteria
        let executed = false;
        for(const interactionID of gameData.storage.interactions.ordering) {
            // Retrieve interaction data and filter components
            const interactionData = gameData.storage.interactions.data[interactionID];
            if(interactionData.action !== selectedAction) { continue; }
            if(interactionData.components[0] !== selectedComponents[0] 
                || (actionData.order === false && interactionData.components[1] !== selectedComponents[0])) { continue; }
            if(interactionData.components[1] !== "" && (interactionData.components[1] !== selectedComponents[1]
                || (actionData.order === false && interactionData.components[0] !== selectedComponents[1]))) { continue; }

            // Iterate through criteria and check whether they are matched
            executed = true;
            selectedAction = undefined;
            selectedComponents = [];
            for(const criteriaID of interactionData.criteria.ordering) {
                const criteriaData = interactionData.criteria.data[criteriaID];

                // Check individual criteria
                let passedCriteria = true;
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
                }

                if(passedCriteria === false) { continue; }
            }

            // Criteria passed, now execute results
            for(const resultID of interactionData.results.ordering) {
                const resultData = interactionData.results.data[resultID];

                // Execute individual results
                switch(resultData.type) {
                    case "setFlag": {
                        flags[resultData.args[0]] = resultData.args[1];
                    } break;
                    case "setState": {
                        currentState = resultData.args[0];
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
        }

        // Show "you can't do that" placeholder dialog
        if(executed === false) {
            dialogText = "You can't do that!"
            selectedAction = undefined;
            selectedComponents = [];
        }
    }
</script>

<div class="flex flex-row items-stretch space-x-4
	absolute inset-0 p-4
    text-slate-400">
	<FormGrouping class="w-1/4">
        <svelte:fragment slot="content">
            <div class="flex flex-col items-stretch space-y-4">
                {#if gameData.storage.states.data[currentState].imageB64 !== ""
                    && gameData.storage.states.data[currentState].imageB64 !== undefined}
                    <img class="h-2/3 object-contain w-full" src={gameData.storage.states.data[currentState].imageB64} />
                {/if}
                <p>{gameData.storage.states.data[currentState].description}</p>
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
                            <p>{gameData.data.restraintLocations.data[restraintLocationID].name}</p>
                            {restraintMappings[restraintLocationID] ?? ""} <!-- Yeah it's disgusting... -->
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
                <a class="max-w-lg bg-slate-800 rounded space-y-4
                    p-4 text-center"
                    on:click={hideDialog}>
                    <p>{dialogText}</p>
                    <p class="text-sm text-slate-500">[ click to close dialog ]</p>
                </a>
            {/if}
        </div>
    </div>
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