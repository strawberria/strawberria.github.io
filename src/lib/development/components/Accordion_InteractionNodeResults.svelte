<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { Text, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_InteractionNodeResult from "$lib/development/components/AccordionItem_InteractionNodeResult.svelte";
    import { gameStore } from "$lib/development/functions/project";
    import { type GameInteractionNode, type GameInteractionNodeResult } from "$lib/global/functions/typings";
    import { bundleValidStore, interactionResultTitle } from "$lib/development/functions/project";

    let dispatch = createEventDispatcher();

    export let show: boolean;
    export let interactionIndex: number;
    export let interactionID: string;
    export let currentNodeIndex: number;
    export let currentNodeID: string;
    export let currentNodeData: GameInteractionNode;
    $: { currentNodeData; dispatch("change"); }
    let resultAccordionOpenStore: Writable<boolean[]> = writable([]);
    let currentResultIndex: number | undefined = undefined;
    let currentResultIDStore: Writable<string | undefined> = writable(undefined);
    let currentResultData: GameInteractionNodeResult | undefined = undefined;

    // Handlers for individual interaction node results
    function createNodeResult(): [string, GameInteractionNodeResult] {
        const interactionID = randomID("result");
        return [interactionID, { type: "restraintAdd", args: ["", ""] }];
    }
    currentResultIDStore.subscribe(_ => {
        currentResultIndex = undefined;
        currentResultData = undefined;

        if($currentResultIDStore === undefined) { return; }
        
        currentResultIndex = currentNodeData.results.findIndex(fullData => fullData[0] === $currentResultIDStore);
        if(currentResultIndex === undefined) { return; } // Should never happen
        currentResultData = currentNodeData.results[currentResultIndex][1];
    });
    $: {
        // Reset the current result ID when interaction changes
        interactionID;
        $currentResultIDStore = undefined;
    }
</script>

<AccordionHeader class={show ? "" : "hidden"}
    label="Results"
    forceRefresh={true}
    accordionOpenStore={resultAccordionOpenStore}
    currentIDStore={currentResultIDStore}
    orderedData={currentNodeData.results}
    callback={() => { currentNodeData = currentNodeData }}
    callbackCreate={createNodeResult} />
<Accordion class={`accordion grow mt-[0.625em] ${show ? "" : "hidden"}`}>
    {#each currentNodeData.results as [resultID, resultData], index}
        <!-- Bundle has issues after deletion, race condition -->
        {#if $bundleValidStore["interactions"]["results"][interactionIndex][currentNodeIndex]}
            <AccordionItem class={$bundleValidStore["interactions"]["results"][interactionIndex][currentNodeIndex][index] 
                    ? "item-valid" : "item-error"}
                transitionType="slide" transitionParams={{ duration: 200 }}
                bind:open={$resultAccordionOpenStore[index]}>
                <Text slot="header" class="overflow-x-hidden whitespace-nowrap text-ellipsis mr-[0.5em]"
                    size="md">
                    {#key $bundleValidStore}
                        {interactionResultTitle(resultData, $gameStore)}
                    {/key}
                </Text>
                <AccordionItem_InteractionNodeResult resultData={resultData}
                    on:change={() => { currentNodeData = currentNodeData }} />
            </AccordionItem>
        {/if}
    {/each}
</Accordion>