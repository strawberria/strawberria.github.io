<script lang="ts">
    import { get, writable } from "svelte/store";
    import type { Writable } from "svelte/store"
    import SvelteMarkdown from 'svelte-markdown';
    import IconButton from "./IconButton.svelte";
    import LabelSelect from "./LabelSelect.svelte";
    import Section from "./Section.svelte";
    import SectionCol from "./SectionCol.svelte";
    import SectionRow from "./SectionRow.svelte";
    import type { ProjectActionData, ProjectData, ProjectLocationData, ProjectObjectData, ProjectRestraintData, ProjectRestraintLocationData, ProjectStateData, SelectChoiceData } from "../typings";
    import { onMount } from "svelte";

    let previousStateID: string | null = null;
    export let gameDataStore: Writable<ProjectData>;
    export let usingDevkit: boolean = false;

    interface PlaythroughData {
        stateID:       string;
        locationID:    string;
        restraints:    { [restraintLocationID: string]: string | null };
        objectIDs:     string[];
        flags:         { [flagKey: string]: string };
        locationIDs:   string[];
        attempts:      number;
    }
    function resetPlaythrough(): PlaythroughData {
        return {
            // Choose first-ordered non-ending state
            stateID: $gameDataStore.game.states
                .map((stateID): [string, ProjectStateData] => [stateID, $gameDataStore.data.states[stateID]])
                .filter(([stateID, stateData]) => ["normal", "transition"].includes(stateData.type))
                [0][0],
            locationID: $gameDataStore.game.locations
                .filter(locationID => $gameDataStore.data.locations[locationID].initial === true)
                [0],
            // Set initial restraints for each restraint location
            restraints: $gameDataStore.game.restraintLocations
                .map((restraintLocationID): [string, ProjectRestraintLocationData] => 
                    [restraintLocationID, $gameDataStore.data.restraintLocations[restraintLocationID]])
                .reduce((previous, current) => {
                    previous[current[0]] = current[1].initialRestraintID;   
                    return previous;
                }, {} as { [restraintLocationID: string]: string | null }),
            // Set initially revealed objects, sort every time added or removed
            objectIDs: $gameDataStore.game.objects
                .filter(objectID => $gameDataStore.data.objects[objectID].initial === true),
            flags: {},
            locationIDs: $gameDataStore.game.locations
                .filter(locationID => $gameDataStore.data.locations[locationID].initial === true),
            attempts: 0,
        };
    }
    function revertStateID() {
        $playthroughStore.stateID = previousStateID as string;
    }
    function continueState() {
        previousStateID = $playthroughStore.stateID;
        const currentStateIndex = $gameDataStore.game.states.indexOf($playthroughStore.stateID);
        $playthroughStore.stateID = $gameDataStore.game.states[currentStateIndex+1]
    }
    let playthroughStore: Writable<PlaythroughData> = writable(resetPlaythrough());

    function _orderedPlaythroughIndividualSort(data: string[], order: string[]) {
        data.sort((a, b) => {
            const aIndex = order.indexOf(a);
            const bIndex = order.indexOf(b);
            return aIndex < bIndex ? -1 : aIndex === bIndex ? 0 : 1;
        });
    }
    function orderedPlaythroughSort() {
        _orderedPlaythroughIndividualSort($playthroughStore.objectIDs, $gameDataStore.game.objects);
        _orderedPlaythroughIndividualSort($playthroughStore.locationIDs, $gameDataStore.game.locations);
        $playthroughStore = $playthroughStore; // Force update
    }

    let locationChoiceData: SelectChoiceData[] = [];
    playthroughStore.subscribe((playthroughData) => {
        locationChoiceData = playthroughData.locationIDs
            .map((locationID): [string, ProjectLocationData] => [locationID, $gameDataStore.data.locations[locationID]])
            .map(([locationID, locationData]) => ({
                key: locationID, display: locationData.name, enabled: true
            }));
    });

    const invalidDialogText = "You can't do that!";
    let dialogHeader: string | null = null;
    let dialogText: string | null = null;
    function setDialog(text: string, header = true) {
        updateCurrentActionText();
        dialogHeader = header
            ? $currentActionTextStore
            : "";
        dialogText = text;
    }
    function clearDialog() {
        dialogHeader = null;
        dialogText = null;
    }

    let currentActionTextStore: Writable<string> = writable("");
    let currentActionStore: Writable<[null, null] | [string, ProjectActionData]> = writable([null, null]);
    // Too lazy to work with arrays, so here are hardcoded stores
    type CurrentComponentStore = [null, null, null]
        | [string, "restraints", ProjectRestraintData]
        | [string, "restraintLocations", ProjectRestraintLocationData]
        | [string, "objects", ProjectObjectData];
    let currentComponent1Store: Writable<CurrentComponentStore> = writable([null, null, null]);
    let currentComponent2Store: Writable<CurrentComponentStore> = writable([null, null, null]);
    function resetActionComponentStores() {
        $currentActionStore = [null, null];
        $currentComponent1Store = [null, null, null];
        $currentComponent2Store = [null, null, null];
    }
    function updateCurrentActionText() {
        if($currentActionStore[0] === null) { 
            // Why do I need to set instead of assign?
            // Issue with Svelte store reactivity?
            currentActionTextStore.set(""); 

            return;
        }

        $currentActionTextStore = $currentActionStore[0] === "examine"
            ? "Examine" 
            : $currentActionStore[1].name;
        if($currentComponent1Store[0] !== null) {
            $currentActionTextStore += ` ${$currentComponent1Store[2].name}`;
            if($currentActionStore[0] !== "examine") {
                $currentActionTextStore += ` ${$currentActionStore[1].verb}`
            }
            if($currentComponent2Store[0] !== null) {
                $currentActionTextStore += ` ${$currentComponent2Store[2].name}`;
            }
        }
    }
    currentActionStore.subscribe(updateCurrentActionText);
    currentComponent1Store.subscribe(updateCurrentActionText);
    currentComponent2Store.subscribe(updateCurrentActionText);
    
    function xor(a: boolean, b: boolean) { return (a || b) && (a !== b); }

    // Checks whether the current action and components match any interactions
    // If so, execute results and return true
    function checkInteraction(): boolean {
        const orderedInteractionData = $gameDataStore.game.interactions
            .map((interactionID) => $gameDataStore.data.interactions[interactionID]);
        for(const interactionData of orderedInteractionData) {
            // Check whether bound state exists and whether matches
            if(interactionData.stateID !== null 
                && $playthroughStore.stateID !== interactionData.stateID) {
                    continue;
            } 
            // Check whether interaction action (non-null) matches current action
            if(interactionData.actionID !== null
                && $currentActionStore[0] !== interactionData.actionID) {
                    continue;
            }
            // Check whether component 1 and 2 mismatch
            // Yes, I can't be bothered to iterate index this, yawn
            const component1Matches1 = interactionData.componentIDs[0] === "anything"
                ? $currentComponent1Store[0] !== null
                : interactionData.componentIDs[0] === $currentComponent1Store[0];
            const component2Matches2 = interactionData.componentIDs[1] === "anything"
                ? $currentComponent2Store[0] !== null
                : interactionData.componentIDs[1] === $currentComponent2Store[0];
            if(!component1Matches1 || !component2Matches2) {
                // Immediately return if order forced and 1/2 can't be exchanged
                if($currentActionStore[1].order === true) { continue; }

                // Check whether component 1 matches 2 and vice versa
                const component1Matches2 = interactionData.componentIDs[0] === "anything"
                    ? $currentComponent2Store[0] !== null
                    : interactionData.componentIDs[0] === $currentComponent2Store[0];
                const component2Matches1 = interactionData.componentIDs[1] === "anything"
                    ? $currentComponent1Store[0] !== null
                    : interactionData.componentIDs[1] === $currentComponent1Store[0];

                // Doesn't match means no components match, skip interaction
                if(!component1Matches2 || !component2Matches1) { continue; }
            }

            // Components match, now iterate through criteria and ensure all match
            let allCriteriasMatch = true;
            const interactionCriteriaData = Object.values(interactionData.data.criteria);
            for(const criteriaData of interactionCriteriaData) {
                const matches = (["flagEquals", "flagNotEquals"].includes(criteriaData.type)  
                        && (xor(
                            $playthroughStore.flags[criteriaData.args[0]] === criteriaData.args[1],
                            criteriaData.type === "flagNotEquals"
                        )))
                    || (["objectFound", "objectNotFound"].includes(criteriaData.type)
                        && (xor(
                            $playthroughStore.objectIDs.includes(criteriaData.args[0]),
                            criteriaData.type === "objectNotFound"
                        )))
                    || (["objectFoundTag", "objectNotFoundTag"].includes(criteriaData.type)
                        && (xor(
                            $playthroughStore.objectIDs
                                .map((objectID) => $gameDataStore.data.objects[objectID])
                                .some((objectData) => objectData.tags.includes(criteriaData.args[0])),
                            criteriaData.type === "objectNotFoundTag"
                        )))
                    || (["restraintWearing", "restraintNotWearing"].includes(criteriaData.type)
                        && (xor(
                            Object.values($playthroughStore.restraints).includes(criteriaData.args[0]),
                            criteriaData.type === "restraintNotWearing"
                        )))
                    || (["restraintWearingTag", "restraintNotWearingTag"].includes(criteriaData.type)
                        && (xor(
                            Object.values($playthroughStore.restraints)
                                .map((restraintID) => $gameDataStore.data.restraints[restraintID])
                                .some((restraintData) => restraintData.tags.includes(criteriaData.args[0])),
                            criteriaData.type === "restraintNotWearingTag"
                        )))
                    // Not sure how these should interact with interchangeable interaction components
                    || (criteriaData.type === "targetTag_component1"
                        && $currentComponent1Store[0] !== null
                        && $currentComponent1Store[1] !== "restraintLocations"
                        && $currentComponent1Store[2].tags.includes(criteriaData.args[0]))
                    || (criteriaData.type === "targetTag_component2"
                        && $currentComponent2Store[0] !== null
                        && $currentComponent2Store[1] !== "restraintLocations"
                        && $currentComponent2Store[2].tags.includes(criteriaData.args[0]));

                if(matches === false) { 
                    allCriteriasMatch = false;
                    break;
                }
            }

            // Immediately return if criteria doesn't match
            if(allCriteriasMatch === false) {
                continue;
            }

            // Criteria matches, iterate through and handle results
            const orderedInteractionResultData = interactionData.order.results
                .map((resultID) => interactionData.data.results[resultID]);
            for(const resultData of orderedInteractionResultData) {
                if(["restraintAdd", "restraintRemove"].includes(resultData.type)) {
                    const restraintData = $gameDataStore.data.restraints[resultData.args[0]];
                    $playthroughStore.restraints[restraintData.restraintLocationID] = resultData.type === "restraintAdd"
                        ? resultData.args[0] : null;
                } else if(["restraintAddTarget", "restraintRemoveTarget"].includes(resultData.type)) {
                    // Check whether component ID at given index 0/1 is a valid target
                    const currentComponentData = get(resultData.args[0] === 0
                        ? currentComponent1Store
                        : currentComponent2Store);
                    if(currentComponentData[1] === "restraints") {
                        const restraintData = currentComponentData[2] as ProjectRestraintData;
                        $playthroughStore.restraints[restraintData.restraintLocationID] = resultData.type === "restraintAddTarget"
                            ? resultData.args[0] : null;
                    }
                } else if(resultData.type === "objectReveal" 
                    && $playthroughStore.objectIDs.includes(resultData.args[0]) === false) {
                        $playthroughStore.objectIDs.push(resultData.args[0]);
                        orderedPlaythroughSort();
                } else if(resultData.type === "objectHide") {
                    const objectIDIndex = $playthroughStore.objectIDs.indexOf(resultData.args[0]);
                    if(objectIDIndex !== -1) {
                        $playthroughStore.objectIDs.splice(objectIDIndex, 1);
                        orderedPlaythroughSort();
                    }
                } else if(resultData.type === "setState") {
                    previousStateID = $playthroughStore.stateID;
                    $playthroughStore.stateID = resultData.args[0];
                    $playthroughStore.attempts = 0;
                } else if(resultData.type === "setFlag") {
                    $playthroughStore.flags[resultData.args[0]] = resultData.args[1];
                } else if(resultData.type === "showDialog") {
                    setDialog(resultData.args[0]);
                } else if(resultData.type === "locationAdd"
                    && $playthroughStore.locationIDs.includes(resultData.args[0]) === false) {
                        $playthroughStore.locationIDs.push(resultData.args[0]);
                        orderedPlaythroughSort();       
                } else if(resultData.type === "locationRemove") {
                    const locationIDIndex = $playthroughStore.locationIDs.indexOf(resultData.args[0]);
                    if(locationIDIndex !== -1) {
                        if(resultData.args[1] !== null
                            && !$playthroughStore.locationIDs.includes(resultData.args[1])) {
                                // Backup functionality: add backup location if not already included
                                $playthroughStore.locationIDs.push(resultData.args[1]);
                                orderedPlaythroughSort(); // Necessary?
                        }

                        if($playthroughStore.locationID === resultData.args[0]) {
                            // Replace location ID with backup / first if currently selected
                            if(resultData.args[1] !== null) {
                                $playthroughStore.locationID = resultData.args[1];
                            } else {
                                $playthroughStore.locationID = $playthroughStore.locationIDs
                                    .filter(id => id !== resultData.args[0])[0];
                            }
                        }

                        $playthroughStore.locationIDs.splice(locationIDIndex, 1);
                        orderedPlaythroughSort();
                    }
                }

                // Necessary because reactivity is really iffy
                playthroughStore.set($playthroughStore);
            }

            return true;
        }
        
        // No matches, return false
        return false;
    }

    function handleInvalid() {
        setDialog(invalidDialogText);
        $playthroughStore.attempts++;
        const stateData = $gameDataStore.data.states[$playthroughStore.stateID];
        if(stateData.maxAttempts !== -1
            && $playthroughStore.attempts === stateData.maxAttempts) {
            // If maximum attempts met, then transition state
            previousStateID = $playthroughStore.stateID;
            $playthroughStore.stateID = stateData.transitionStateID;
            $playthroughStore.attempts = 0;
        }
    }
    function handleClick(type: "action" | "restraints" | "restraintLocations" | "objects", id: string) {
        // Ignore any object and restraint click if action is not selected
        if($currentActionStore[0] === null && type !== "action") { 
            return; 
        }
        // If action not selected, select action, update text, and terminate
        if(type === "action") { 
            $currentActionStore = $currentActionStore[0] === null
                ? [id, $gameDataStore.data.actions[id]]
                : [null, null];
                
            return; 
        }

        // If component 1 not selected, select component 1 
        if($currentComponent1Store[0] === null) {
            $currentComponent1Store = [
                id,
                type as any,
                $gameDataStore.data[type][id] as any,
            ];

            if($currentActionStore[0] === "examine") {
                if($currentComponent1Store[1] !== "restraintLocations") {
                    setDialog($currentComponent1Store[2].examine);
                } else {
                    handleInvalid();
                }

                resetActionComponentStores();

                return;
            }

            const interactionFound = checkInteraction();

            // If only 1 argument, reset and terminate
            if(interactionFound || $currentActionStore[1].two === false) {
                resetActionComponentStores();

                // If no match and reset, show "You can't do that! dialog"
                if(!interactionFound) {
                    handleInvalid();
                }
            }

            return;
        }

        // If component 2 not selected, select component 2
        if($currentComponent2Store[0] === null) {
            $currentComponent2Store = [
                id,
                type as any,
                $gameDataStore.data[type][id] as any,
            ];

            const interactionFound = checkInteraction();
            if(!interactionFound) {
                handleInvalid();
            }

            // Reset and terminate because max 2 arguments
            resetActionComponentStores();
            return;
        }
    }

    const fontFamily = getComputedStyle(document.head).fontFamily;
    const fontSize = parseFloat(getComputedStyle(document.head).fontSize);
    let objectNameWidthEM: number = 10; // em
    let actionNameWidthEM: number = 10; // em
    gameDataStore.subscribe(gameData => {
        const measureCanvas = document.createElement("canvas");
        const measureContext = measureCanvas.getContext("2d");
        measureContext.font = `${fontSize}px ${fontFamily}`

        // Measure maximum text width of actions
        let maximumActionWidth: number = measureContext.measureText("Examine").width;
        for(const actionData of Object.values(gameData.data.actions)) {
            const textWidth = measureContext.measureText(actionData.name);
            if(textWidth.width > maximumActionWidth) { maximumActionWidth = textWidth.width; }
        }

        // Measure maximum text width of objects
        let maximumObjectWidth: number = 0;
        for(const objectData of Object.values(gameData.data.objects)) {
            const textWidth = measureContext.measureText(objectData.name);
            if(textWidth.width > maximumObjectWidth) { maximumObjectWidth = textWidth.width; }
        }

        actionNameWidthEM = Math.ceil((maximumActionWidth + 2 * fontSize) / fontSize * 10) / 10;
        objectNameWidthEM = Math.ceil((maximumObjectWidth + 2 * fontSize) / fontSize * 10) / 10;
    })

    // ==== Canvas rendering stuff ====
    let canvas: HTMLCanvasElement;
    let canvasWidth: number;
    let canvasHeight: number;
    let context: CanvasRenderingContext2D;
    function updateCanvasContext() {
        if(canvas) { 
            context = canvas.getContext("2d") as CanvasRenderingContext2D;
        }
    }
    onMount(updateCanvasContext);
    playthroughStore.subscribe(updateCanvasContext);

    // Renders a dumb number of times, can't do anything about it
    function handleMinimapClick(event?: MouseEvent) {
        // For efficiency, only re-render when tab is selected
        if(event === undefined || context === undefined || canvas === null) { return; }

        // Get absolute coordinates for checking click target
        const boundingRect = canvas.getBoundingClientRect();
        const clickCoordX = event.clientX - boundingRect.left;
        const clickCoordY = event.clientY - boundingRect.top;

        // Iterate over minimap objects, drawing paths and checking inclusion
        const locationData = $gameDataStore.data.locations[$playthroughStore.locationID];
        for(const minimapObjectData of locationData.order.locationObjects
            .map(locationID => locationData.data.locationObjects[locationID])) {
                const path = new Path2D();
                if(minimapObjectData.type === "vector") {
                    for(const [pointRatioX, pointRatioY] of minimapObjectData.args) {
                        const pointCoordX = Math.floor(pointRatioX * boundingRect.width);
                        const pointCoordY = Math.floor(pointRatioY * boundingRect.height);
                        path.lineTo(pointCoordX, pointCoordY);
                    }
                } else { // if(minimapObjectData.type === "circle")
                    const [[centerRatioX, centerRatioY], [radiusRatioX, radiusRatioY]] = minimapObjectData.args;
                    const centerCoordX = Math.floor(centerRatioX * boundingRect.width);
                    const centerCoordY = Math.floor(centerRatioY * boundingRect.height);
                    const radiusCoordX = Math.floor(radiusRatioX * boundingRect.width);
                    const radiusCoordY = Math.floor(radiusRatioY * boundingRect.height);
                    const radius = Math.sqrt(Math.pow(centerCoordX - radiusCoordX, 2) + Math.pow(centerCoordY - radiusCoordY, 2));
                    path.arc(centerCoordX, centerCoordY, radius, 0, 2 * Math.PI);
                }

                // Check whether click point is included within the path
                if(context.isPointInPath(path, clickCoordX, clickCoordY)) {
                    // Reveal object and show dialog if defined
                    if(minimapObjectData.objectID !== undefined
                        && $playthroughStore.objectIDs.includes(minimapObjectData.objectID) === false) {
                        $playthroughStore.objectIDs.push(minimapObjectData.objectID);
                        orderedPlaythroughSort();
                    }
                    if(minimapObjectData.dialog !== "") {
                        setDialog(minimapObjectData.dialog, false);
                    }

                    // Don't execute interaction since not included
                }
        }
    }
</script>

<svelte:head>
    {#if !usingDevkit && false}
        <script src='https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'></script>
        <script>
            const id = setInterval(() => {
                if(kofiWidgetOverlay !== undefined) {
                    kofiWidgetOverlay.draw('strawberria', {
                        'type': 'floating-chat',
                        'floating-chat.core.position.bottom-left': 'position: fixed; bottom: 50px; left: 10px; width: 160px; height: 200px;',
                        'floating-chat.donateButton.text': 'Support me',
                        'floating-chat.donateButton.background-color': '#334155',
                        'floating-chat.donateButton.text-color': '#fff'
                    });
                    clearInterval(id);
                }
            }, 100)
        </script>
    {/if}
</svelte:head>

{#if $gameDataStore.data.states[$playthroughStore.stateID].type === "normal"}
    <SectionRow class="w-full h-full">
        <!-- style="margin-bottom: 3.25rem" -->
        <SectionCol width={30}>
            <Section class="grow"
                innerClass="h-full py-2 px-0.5 items-stretch">
                <svelte:fragment slot="content">
                    <!-- border-2 border-slate-700  -->
                    <img class="mb-1 rounded"
                        style="max-height: 45%; object-fit: contain"
                        src={$gameDataStore.data.images[
                            $gameDataStore.data.states[$playthroughStore.stateID].imageID
                        ].imageb64} />
                    <div class="whitespace-pre-wrap w-full text-left">
                        <SvelteMarkdown source={$gameDataStore.data.states[$playthroughStore.stateID].description} />
                    </div>

                    <div class="grow" />

                    <div class="w-full space-y-1">
                        {#each $gameDataStore.data.states[$playthroughStore.stateID].hints as hintData, index}
                            <div class="w-full text-right h-6 select-none">
                                {#if hintData.attempts !== -1
                                    && $playthroughStore.attempts >= hintData.attempts}
                                    <p class="hover:underline hover:text-slate-300 cursor-pointer" 
                                        on:click={() => { setDialog(hintData.text)}}>
                                        Hint {index + 1}
                                    </p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </Section>
        </SectionCol>
        <SectionCol style="width: calc(40% - 0.75em)">
            <!-- Copied from LocationsMinimap -->
            <div class="flex flex-col items-center justify-center grow">
                {#if dialogText !== null}
                    <Section class="select-none rounded-lg"
                        style="max-width: 80%" 
                        innerClass="whitespace-pre-wrap" 
                        nogrow={true}
                        nowidth={true}
                        onclick={() => { clearDialog() }}>
                        <svelte:fragment slot="content">
                            <div class="flex flex-col p-1 pb-2 space-y-3">
                                <p class="whitespace-pre-wrap underline">
                                    {dialogHeader}
                                </p>
                                <SvelteMarkdown source={dialogText} />
                                <p class="text-xs text-slate-500">( Click anywhere to close )</p>
                            </div>
                        </svelte:fragment>
                    </Section>
                {/if}
            </div>
            <Section class="select-none"
                label="Actions" 
                smallHeader={true} 
                nogrow={true}>
                <svelte:fragment slot="header">
                    <div class="flex flex-col justify-end text-right">
                        <div class="h-6">
                            <SvelteMarkdown source={$currentActionTextStore} />
                        </div>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="content">
                    <div class="grid px-1.5 pb-0.5" 
                        style={`grid-template-columns: repeat(auto-fill, minmax(${actionNameWidthEM}em, 6fr));
                        row-gap: 0.5em`}>
                        {#each [
                                { "id": "examine", "name": "Examine" },
                                ...$gameDataStore.game.actions
                                    .filter((actionID) => $gameDataStore.data.states[
                                        $playthroughStore.stateID].availableActionIDs
                                        .includes(actionID))
                                    .map((actionID) => $gameDataStore.data.actions[actionID]),
                            ]
                            as actionData}
                            <div class="flex flex-row items-start">
                                <p class="text-left cursor-pointer hover:underline hover:text-slate-300
                                    whitespace-nowrap"
                                    on:click={() => { handleClick("action", actionData.id); }}>
                                    {actionData.name}
                                </p>
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </Section>
            <Section class="select-none"
                label="Objects"
                smallHeader={true} 
                height={40}>
                <svelte:fragment slot="header">
                    <div></div>
                </svelte:fragment>
                <svelte:fragment slot="content">
                    <div class="grid mt-1 px-1.5" 
                        style={`grid-template-columns: repeat(auto-fill, minmax(${objectNameWidthEM}em, 6fr));
                        row-gap: 0.5em`}>
                        {#each $playthroughStore.objectIDs
                            .map((objectID) => $gameDataStore.data.objects[objectID])
                            as objectData}
                            <!-- Necessary to reduce click hitbox -->
                            <div class="flex flex-row items-start">
                                <p class="min-w-0 text-left cursor-pointer hover:underline hover:text-slate-300
                                    whitespace-nowrap"
                                    on:click={() => { handleClick("objects", objectData.id); }}>
                                    {objectData.name}
                                </p>
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </Section>
        </SectionCol>
        <SectionCol style="width: calc(30% - 0.75em)">
            <!-- Copied from LocationsMinimap -->
            <Section nogrow={true}>
                <svelte:fragment slot="content">
                    <div class="flex flex-col w-full text-left px-1 select-none">
                        <p class="text-lg font-semibold text-slate-300">{$gameDataStore.game.metadata.title}</p>
                        <div class="flex flex-row w-full">
                            <p>
                                Developed by: 
                                <span class="underline">
                                    {$gameDataStore.game.metadata.author}
                                </span>
                            </p>
                            <div class="grow" />
                            <p>Version {$gameDataStore.game.metadata.version}</p>
                        </div>
                    </div>
                </svelte:fragment>
            </Section>
            <Section innerClass="py-1 px-0.5 pb-0.5" 
                nogrow={true}>
                <svelte:fragment slot="content">
                    <!-- Can't put this below the canvas for some reason -->
                    <canvas class="bg-inherit aspect-square
                        border-2 border-slate-700 rounded-sm mb-1" 
                        style={`background-image: url(${$gameDataStore.data.locations[$playthroughStore.locationID].imageID !== null
                                && $gameDataStore.data.images[$gameDataStore.data.locations
                                    [$playthroughStore.locationID].imageID].imageb64 !== null
                                        ? $gameDataStore.data.images[$gameDataStore.data.locations
                                            [$playthroughStore.locationID].imageID].imageb64
                                        : ""}); 
                            background-size: contain;
                            background-repeat: no-repeat;
                            background-position: center;`}
                        bind:this={canvas}
                        width={canvasWidth}
                        height={canvasHeight}
                        bind:clientWidth={canvasWidth}
                        bind:clientHeight={canvasHeight}
                        on:click={handleMinimapClick} />
                    <!-- <div class="flex flex-col w-full items-end"> -->
                    <LabelSelect class="w-2/3 pt-0.5"
                        choicesData={locationChoiceData} 
                        bind:value={$playthroughStore.locationID} />
                    <!-- </div> -->
                </svelte:fragment>
            </Section>
            <Section class="select-none"
                innerClass="px-1 pb-0.5"
                label="Current Restraints" 
                smallHeader={true}>
                <svelte:fragment slot="content">
                    <!-- Can't override space-y-2 through innerClass? -->
                    <div class="flex flex-col w-full h-full space-y-1">
                        {#each $gameDataStore.game.restraintLocations as restraintLocationID}
                            <div class="flex flex-row w-full">
                                <p class="cursor-pointer hover:underline hover:text-slate-300"
                                    on:click={() => { handleClick("restraintLocations", restraintLocationID); }}>
                                    {$gameDataStore.data.restraintLocations[restraintLocationID].name}
                                </p>
                                <div class="grow" />
                                <p class="cursor-pointer hover:underline hover:text-slate-300
                                    text-right"
                                    on:click={() => { handleClick("restraints", $playthroughStore.restraints[restraintLocationID]); }}>
                                    {#if $playthroughStore.restraints[restraintLocationID] !== null}
                                        {$gameDataStore.data.restraints[$playthroughStore.restraints[restraintLocationID]].name}
                                    {/if}
                                </p>
                            </div>
                        {/each}
                    </div>
                </svelte:fragment>
            </Section>
        </SectionCol>
    </SectionRow>
{:else}
    <div class="flex flex-col w-full h-full items-center
        scrollbar-thin scrollbar-thumb-slate-700 overflow-x-hidden
        pr-4">
        <div class="flex flex-col w-full items-center">
            <Section nogrow={true} 
                class="w-1/2 min-h-0 rounded-lg"
                innerClass="items-center pt-2 pb-1.5 w-11/12">
                <svelte:fragment slot="content">
                    <img class="mb-1 border border-slate-700 rounded"
                        style="max-width: 60%; object-fit: contain"
                        src={$gameDataStore.data.images[
                            $gameDataStore.data.states[$playthroughStore.stateID].imageID
                        ].imageb64} />
                    <div class="whitespace-pre-wrap w-full text-left pb-2">
                        <SvelteMarkdown source={$gameDataStore.data.states[$playthroughStore.stateID].description} />
                    </div>
                    {#if $gameDataStore.data.states[$playthroughStore.stateID].type === "goodEnding"}
                        <IconButton label="Restart"
                            class="w-22 rounded"
                            onclick={() => { $playthroughStore = resetPlaythrough() }}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
                            </svg>
                        </IconButton>
                    {:else if $gameDataStore.data.states[$playthroughStore.stateID].type === "badEnding"}
                        <IconButton label="Try Again"
                            class="w-22 rounded"
                            onclick={revertStateID}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>                              
                        </IconButton>
                    {:else}
                        <IconButton label="Continue"
                            class="w-22 rounded"
                            onclick={continueState}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>                          
                        </IconButton>
                    {/if}
                </svelte:fragment>
            </Section>
        </div>
    </div>
{/if}