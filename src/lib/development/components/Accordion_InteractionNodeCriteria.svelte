<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { Text, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_InteractionNodeCriteria from "$lib/development/components/AccordionItem_InteractionNodeCriteria.svelte";
    import { gameStore } from "$lib/development/functions/project";
    import { type GameInteractionNode, type GameInteractionNodeCriteria } from "$lib/global/functions/typings";
    import { bundleValidStore, interactionCriteriaTitle } from "$lib/development/functions/project";

    let dispatch = createEventDispatcher();

    export let show: boolean;
    export let interactionIndex: number;
    export let interactionID: string;
    export let currentNodeIndex: number;
    export let currentNodeID: string;
    export let currentNodeData: GameInteractionNode;
    $: { currentNodeData; dispatch("change"); }
    let criteriaAccordionOpenStore: Writable<boolean[]> = writable([]);
    let currentCriteriaIndex: number | undefined = undefined;
    let currentCriteriaIDStore: Writable<string | undefined> = writable(undefined);
    let currentCriteriaData: GameInteractionNodeCriteria | undefined = undefined;

    // Handlers for individual interaction node criteria
    function createNodeCriteria(): [string, GameInteractionNodeCriteria] {
        const interactionID = randomID("criteria");
        return [interactionID, { type: "flagEquals", args: ["", ""] }];
    }
    currentCriteriaIDStore.subscribe(_ => {
        currentCriteriaIndex = undefined;
        currentCriteriaData = undefined;

        if($currentCriteriaIDStore === undefined) { return; }
        
        currentCriteriaIndex = currentNodeData.criteria.findIndex(fullData => fullData[0] === $currentCriteriaIDStore);
        if(currentCriteriaIndex === undefined) { return; } // Should never happen
        currentCriteriaData = currentNodeData.criteria[currentCriteriaIndex][1];
    });
    $: {
        // Reset the current criteria ID when interaction changes
        interactionID;
        $currentCriteriaIDStore = undefined;
    }
</script>

<AccordionHeader class={show ? "" : "hidden"}
    label="Criteria"
    forceRefresh={true}
    accordionOpenStore={criteriaAccordionOpenStore}
    currentIDStore={currentCriteriaIDStore}
    orderedData={currentNodeData.criteria}
    callback={() => { currentNodeData = currentNodeData }}
    callbackCreate={createNodeCriteria} />
<Accordion class={`accordion grow mt-[0.625em] ${show ? "" : "hidden"}`}>
    {#each currentNodeData.criteria as [criteriaID, criteriaData], index}
        <!-- Bundle has issues after deletion, race condition -->
        {#if $bundleValidStore["interactions"]["criteria"][interactionIndex][currentNodeIndex]}
            <AccordionItem class={$bundleValidStore["interactions"]["criteria"][interactionIndex][currentNodeIndex][index] 
                    ? "item-valid" : "item-error"}
                transitionType="slide" transitionParams={{ duration: 200 }}
                bind:open={$criteriaAccordionOpenStore[index]}>
                <Text slot="header" class="mr-[0.5em]" size="md">
                    {#key $bundleValidStore}
                        {interactionCriteriaTitle(criteriaData, $gameStore)}
                    {/key}
                </Text>
                <AccordionItem_InteractionNodeCriteria criteriaData={criteriaData}
                    on:change={() => { currentNodeData = currentNodeData }} />
            </AccordionItem>
        {/if}
    {/each}
</Accordion>