<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Divider, Flex, NativeSelect, Switch, Text, TextInput, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import Accordion_InteractionNodeCriteria from "$lib/development/components/Accordion_InteractionNodeCriteria.svelte";
    import Accordion_InteractionNodeFlagMap from "$lib/development/components/Accordion_InteractionNodeFlagMap.svelte";
    import Accordion_InteractionNodeResults from "$lib/development/components/Accordion_InteractionNodeResults.svelte";
    import ErrorMessage from "$lib/development/components/ErrorMessage.svelte";
    import SelectInteractionNode from "$lib/development/components/SelectInteractionNode.svelte"
    import { interactionNodeTypeSelectData, type GameInteraction, type GameInteractionNode } from "$lib/global/functions/typings";
    import { bundleValidStore } from "$lib/development/functions/project";
    import { writable, type Writable } from "svelte/store";

    const dispatch = createEventDispatcher();

    // Note: reactivity is broken without sub-accordion
    // Cannot uncomment because of infinite hang
    export let interactionIndex: number;
    export let interactionID: string;
    export let interactionData: GameInteraction;
    $: { interactionData; dispatch("change"); }
    let nodeAccordionOpenStore: Writable<boolean[]> = writable([]);
    let currentNodeIndex: number | undefined = undefined;
    let currentNodeIDStore: Writable<string | undefined> = writable(undefined);
    let currentNodeData: GameInteractionNode | undefined = undefined;
    // $: { currentNodeData; interactionData = interactionData; }

    // Handlers for individual interaction nodes
    function createInteractionNode(): [string, GameInteractionNode] {
        const interactionID = randomID("node");
        return [interactionID, { title: "New Node", type: "execute", start: false, end: false,
            nextPass: "", nextFail: "", criteria: [], results: [], flagKey: "", flagMap: [] }];
    }
    currentNodeIDStore.subscribe(_ => {
        currentNodeIndex = undefined;
        currentNodeData = undefined;

        if($currentNodeIDStore === undefined) { return; }

        currentNodeIndex = interactionData.nodes.findIndex(fullData => fullData[0] === $currentNodeIDStore);
        if(currentNodeIndex === undefined) { return; } // Should never happen
        currentNodeData = interactionData.nodes[currentNodeIndex][1];
    });
</script>

<Flex class="h-[calc(100vh-7.75em)]" gap="sm">
    <Flex class="w-[40%]" direction="column" gap="xs">
        <AccordionHeader label="Nodes"
            accordionOpenStore={nodeAccordionOpenStore}
            currentIDStore={currentNodeIDStore}
            orderedData={interactionData.nodes}
            callback={() => { interactionData = interactionData }}
            callbackCreate={createInteractionNode} />
        <Accordion class="accordion accordion-select grow">
            {#each interactionData.nodes as [nodeID, nodeData], index}
                <!-- Bundle has issues after deletion, race condition -->
                {#if $bundleValidStore["interactions"]["nodes"][interactionIndex]}
                    <AccordionItem class={$bundleValidStore["interactions"]["nodes"][interactionIndex][index] 
                            ? "item-valid" : "item-error"}
                        transitionType="slide" transitionParams={{ duration: 200 }}
                        bind:open={$nodeAccordionOpenStore[index]}>
                        <Flex class="min-h-[1.5em] w-full" 
                            slot="header" 
                            direction="row">
                            {#key $bundleValidStore}
                                <Text size="md">
                                    {#if nodeData.type === "flag_map"}
                                        Key = "{nodeData.flagKey}"
                                    {:else}
                                        {nodeData.title}
                                    {/if}
                                </Text>
                                <div class="grow" />
                                <Text class={!nodeData.start ? "invisible" : ""} size="md">/</Text>
                                <Text class="text-center w-[0.75em]" 
                                    size="md" weight="semibold">
                                    {nodeData.type === "criteria_or" 
                                        ? "O" : nodeData.type === "criteria_and"
                                        ? "A" : nodeData.type[0].toUpperCase()}
                                </Text>
                                <Text class={!nodeData.end ? "invisible" : ""} size="md">/</Text>
                            {/key}
                        </Flex>
                    </AccordionItem>
                {/if}
            {/each}
        </Accordion>
        <ErrorMessage show={$bundleValidStore["interactions"]["startings"][interactionIndex] === false}
            text="There should be exactly one starting node!" />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[60%] max-w-[60%]" direction="column">
        {#if currentNodeIndex !== undefined && $currentNodeIDStore !== undefined
            && currentNodeData !== undefined}
            {#key $currentNodeIDStore}
                <Flex class="min-h-[4em]" direction="row" gap="md">
                    {#if currentNodeData.type !== "flag_map"}
                        <TextInput class="w-[55%]"
                            label="Title" 
                            placeholder="Unlock"
                            required={true} 
                            error={currentNodeData.title.length == 0} 
                            bind:value={currentNodeData.title} />
                    {:else}
                        <!-- Show flag key input instead for flag map -->
                        <TextInput class="w-[50%]"
                            label="Flag Key"     
                            placeholder="button_pressed"
                            required={true} 
                            error={currentNodeData.flagKey.length == 0}
                            bind:value={currentNodeData.flagKey} />
                    {/if}
                    <NativeSelect class="w-[45%]" 
                        label="Type"
                        data={interactionNodeTypeSelectData}
                        on:change={() => { currentNodeData = currentNodeData; }}
                        bind:value={currentNodeData.type} />
                    <Flex class="w-[5.5em] h-full shrink-0"
                        direction="column" align="left" justify="center" gap="xs">
                        <Switch label="Start" size="sm" 
                            bind:checked={currentNodeData.start} />
                        <Switch label="End" size="sm" 
                            bind:checked={currentNodeData.end} />
                    </Flex>
                </Flex>
                <Divider orientation="horizontal" /> 
                <!-- Load and hide depending on type - otherwise infinite hang on swap -->
                <!-- Reproduce: expand individual result, swap to criteria / change to criteria node -->
                <Accordion_InteractionNodeResults show={currentNodeData.type === "execute"}
                    interactionIndex={interactionIndex}
                    interactionID={interactionID}
                    currentNodeIndex={currentNodeIndex}
                    currentNodeID={$currentNodeIDStore}
                    currentNodeData={currentNodeData}
                    on:change={() => { interactionData = interactionData; }} />
                <Accordion_InteractionNodeCriteria show={currentNodeData.type.startsWith("criteria")}
                    interactionIndex={interactionIndex}
                    interactionID={interactionID}
                    currentNodeIndex={currentNodeIndex}
                    currentNodeID={$currentNodeIDStore}
                    currentNodeData={currentNodeData}
                    on:change={() => { interactionData = interactionData; }} />
                <Accordion_InteractionNodeFlagMap show={currentNodeData.type === "flag_map"}
                    interactionIndex={interactionIndex}
                    interactionID={interactionID}
                    interactionData={interactionData}
                    currentNodeIndex={currentNodeIndex}
                    currentNodeID={$currentNodeIDStore}
                    currentNodeData={currentNodeData}
                    on:change={() => { interactionData = interactionData; }} />
                {#if currentNodeData.end === false}
                    <!-- Only next node if not last node -->
                    <!-- Note criteria node should never be the last? -->
                    <Divider orientation="horizontal" /> 
                    {#if currentNodeData.type === "execute" || currentNodeData.type === "flag_map"}
                        <!-- Next node (pass or default) -->
                        <SelectInteractionNode class="w-[calc(50%-0.5em)]"
                            label={currentNodeData.type === "execute" ? "Next Node" : "Default Node"}
                            bind:interactionData={interactionData}
                            bind:selectedNodeID={currentNodeData.nextPass}
                            exclude={[$currentNodeIDStore]}/>
                    {:else if currentNodeData.type === "criteria_and" || currentNodeData.type === "criteria_or"}
                        <!-- Next nodes depending on pass or fail -->
                        <Flex class="w-full" direction="row" gap="md">
                            <SelectInteractionNode class="w-[50%]"
                                label="Next Node (Pass)"
                                bind:interactionData={interactionData}
                                bind:selectedNodeID={currentNodeData.nextPass}
                                exclude={[$currentNodeIDStore]}/>
                            <SelectInteractionNode class="w-[50%]"
                                label="Next Node (Fail)"
                                bind:interactionData={interactionData}
                                bind:selectedNodeID={currentNodeData.nextFail}
                                exclude={[$currentNodeIDStore]}/>
                        </Flex>
                    {/if}
                {/if}
            {/key}
        {/if}
    </Flex>
</Flex>

