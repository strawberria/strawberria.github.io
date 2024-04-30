<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { Text, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_InteractionNodeFlagMap from "$lib/development/components/AccordionItem_InteractionNodeFlagMap.svelte";
    import { type GameInteraction, type GameInteractionNode, type GameInteractionNodeFlagMap } from "$lib/global/functions/typings";
    import { bundleValidStore, interactionFlagMapTitle } from "$lib/development/functions/project";

    let dispatch = createEventDispatcher();

    export let show: boolean;
    export let interactionIndex: number;
    export let interactionID: string;
    export let interactionData: GameInteraction;
    export let currentNodeIndex: number;
    export let currentNodeID: string;
    export let currentNodeData: GameInteractionNode;
    $: { currentNodeData; dispatch("change"); }
    let flagMapAccordionOpenStore: Writable<boolean[]> = writable([]);
    let currentFlagMapIndex: number | undefined = undefined;
    let currentFlagMapIDStore: Writable<string | undefined> = writable(undefined);
    let currentFlagMapData: GameInteractionNodeFlagMap | undefined = undefined;

    // Handlers for individual interaction node flagMap
    function createNodeFlagMap(): [string, GameInteractionNodeFlagMap] {
        const interactionID = randomID("flagMap");
        return [interactionID, { value: "", node: "" }];
    }
    currentFlagMapIDStore.subscribe(_ => {
        currentFlagMapIndex = undefined;
        currentFlagMapData = undefined;

        if($currentFlagMapIDStore === undefined) { return; }
        
        currentFlagMapIndex = currentNodeData.flagMap.findIndex(fullData => fullData[0] === $currentFlagMapIDStore);
        if(currentFlagMapIndex === undefined) { return; } // Should never happen
        currentFlagMapData = currentNodeData.flagMap[currentFlagMapIndex][1];
    });
    $: {
        // Reset the current flagMap ID when interaction changes
        interactionID;
        $currentFlagMapIDStore = undefined;
    }
</script>

<AccordionHeader class={show ? "" : "hidden"}
    label="Flag Map"
    forceRefresh={true}
    accordionOpenStore={flagMapAccordionOpenStore}
    currentIDStore={currentFlagMapIDStore}
    orderedData={currentNodeData.flagMap}
    callback={() => { currentNodeData = currentNodeData }}
    callbackCreate={createNodeFlagMap} />
<Accordion class={`accordion grow mt-[0.625em] ${show ? "" : "hidden"}`}>
    {#each currentNodeData.flagMap as [flagMapID, flagMapData], index}
        <!-- Bundle has issues after deletion, race condition -->
        {#if $bundleValidStore["interactions"]["flagMap"][interactionIndex][currentNodeIndex]}
            <AccordionItem class={$bundleValidStore["interactions"]["flagMap"][interactionIndex][currentNodeIndex][index] 
                    ? "item-valid" : "item-error"}
                transitionType="slide" transitionParams={{ duration: 200 }}
                bind:open={$flagMapAccordionOpenStore[index]}>
                <Text slot="header" class="mr-[0.5em]" size="md">
                    {#key $bundleValidStore}
                        {interactionFlagMapTitle(flagMapData, interactionData)}
                    {/key}
                </Text>
                <AccordionItem_InteractionNodeFlagMap interactionData={interactionData}
                    interactionNodeID={currentNodeID}
                    flagMapData={flagMapData}
                    on:change={() => { currentNodeData = currentNodeData }} />
            </AccordionItem>
        {/if}
    {/each}
</Accordion>