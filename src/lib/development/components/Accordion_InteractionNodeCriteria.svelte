<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Accordion, Text, randomID } from "@svelteuidev/core";
    import AccordionHeader from "./AccordionHeader.svelte";
    import AccordionItem_InteractionNodeCriteria from "./AccordionItem_InteractionNodeCriteria.svelte";
    import { type GameInteractionNode, type GameInteractionNodeCriteria } from "../functions/typings";
    import { bundleValidStore } from "../functions/project";
    import { writable, type Writable } from "svelte/store";

    let dispatch = createEventDispatcher();

    export let show: boolean;
    export let interactionIndex: number;
    export let currentNodeIndex: number;
    export let currentNodeID: string;
    export let currentNodeData: GameInteractionNode;
    $: { currentNodeData; dispatch("change"); }
    let currentCriteriaIndex: number | undefined = undefined;
    let currentCriteriaIDStore: Writable<string | undefined> = writable(undefined);
    let currentCriteriaData: GameInteractionNodeCriteria | undefined = undefined;

    // Handlers for individual interaction node criteria
    function createNodeCriteria(): [string, GameInteractionNodeCriteria] {
        const interactionID = randomID("criteria");
        return [interactionID, { title: "New Criteria", type: "flagEquals", args: ["", ""] }];
    }
    function nodeCriteriaOnChange(event: CustomEvent<string | string[] | null>) {
        currentCriteriaIndex = undefined;
        $currentCriteriaIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
        currentCriteriaData = undefined;

        if($currentCriteriaIDStore === undefined) { return; }
        
        currentCriteriaIndex = currentNodeData.criteria.findIndex(fullData => fullData[0] === $currentCriteriaIDStore);
        if(currentCriteriaIndex === undefined) { return; } // Should never happen
        currentCriteriaData = currentNodeData.criteria[currentCriteriaIndex][1];
    }
</script>

<AccordionHeader class={show ? "" : "hidden"}
    label="Criteria"
    currentIDStore={currentCriteriaIDStore}
    orderedData={currentNodeData.criteria}
    callback={() => { currentNodeData = currentNodeData }}
    callbackCreate={createNodeCriteria} />
<Accordion class={`overflow-auto h-full mt-[0.625em] ${show ? "" : "hidden"}`}
    defaultValue={undefined}
    on:change={nodeCriteriaOnChange}>
    {#each currentNodeData.criteria as [criteriaID, criteriaData], index}
        <Accordion.Item class={$bundleValidStore["interactions"]["criteria"][interactionIndex][currentNodeIndex][index] 
            ? "item-valid" : "item-error"}
            value={criteriaID}>
            <Text slot="control" size="md">
                {#key $bundleValidStore}
                    {criteriaData.title}
                {/key}
            </Text>
            <AccordionItem_InteractionNodeCriteria criteriaData={criteriaData}
                on:change={() => { currentNodeData = currentNodeData }} />
        </Accordion.Item>
    {/each}
</Accordion>