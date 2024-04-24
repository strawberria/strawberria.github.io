<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Accordion, Text, randomID } from "@svelteuidev/core";
    import AccordionHeader from "./AccordionHeader.svelte";
    import AccordionItem_InteractionNodeResult from "./AccordionItem_InteractionNodeResult.svelte";
    import { type GameInteractionNode, type GameInteractionNodeResult } from "../functions/typings";
    import { bundleValidStore } from "../functions/project";
    import { writable, type Writable } from "svelte/store";

    let dispatch = createEventDispatcher();

    export let show: boolean;
    export let interactionIndex: number;
    export let currentNodeIndex: number;
    export let currentNodeID: string;
    export let currentNodeData: GameInteractionNode;
    $: { currentNodeData; dispatch("change"); }
    let currentResultIndex: number | undefined = undefined;
    let currentResultIDStore: Writable<string | undefined> = writable(undefined);
    let currentResultData: GameInteractionNodeResult | undefined = undefined;

    // Handlers for individual interaction node results
    function createNodeResult(): [string, GameInteractionNodeResult] {
        const interactionID = randomID("result");
        return [interactionID, { title: "New Result", type: "restraintAdd", args: ["", ""] }];
    }
    function nodeResultOnChange(event: CustomEvent<string | string[] | null>) {
        currentResultIndex = undefined;
        $currentResultIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
        currentResultData = undefined;

        if($currentResultIDStore === undefined) { return; }
        
        currentResultIndex = currentNodeData.results.findIndex(fullData => fullData[0] === $currentResultIDStore);
        if(currentResultIndex === undefined) { return; } // Should never happen
        currentResultData = currentNodeData.results[currentResultIndex][1];
    }
</script>

<AccordionHeader class={show ? "" : "hidden"}
    label="Results"
    currentIDStore={currentResultIDStore}
    orderedData={currentNodeData.results}
    callback={() => { currentNodeData = currentNodeData }}
    callbackCreate={createNodeResult} />
<Accordion class={`overflow-auto h-full mt-[0.625em] ${show ? "" : "hidden"}`}
    defaultValue={undefined}
    on:change={nodeResultOnChange}>
    {#each currentNodeData.results as [resultID, resultData], index}
        <Accordion.Item class={$bundleValidStore["interactions"]["results"][interactionIndex][currentNodeIndex][index] 
            ? "item-valid" : "item-error"}
            value={resultID}>
            <Text slot="control" size="md">
                {#key $bundleValidStore}
                    {resultData.title}
                {/key}
            </Text>
            <AccordionItem_InteractionNodeResult resultData={resultData}
                on:change={() => { currentNodeData = currentNodeData }} />
        </Accordion.Item>
    {/each}
</Accordion>