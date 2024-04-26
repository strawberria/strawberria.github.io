<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, Text, TextInput, Textarea } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import SelectAction from "$lib/development/components/SelectAction.svelte";
    import SelectMultipleComponents from "$lib/development/components/SelectMultipleComponents.svelte";
    import TextLabel from "$lib/development/components/TextLabel.svelte";
    import { type GameInteraction } from "$lib/global/functions/typings";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { getAction } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    export let interactionIndex: number;
    export let interactionID: string;
    export let interactionData: GameInteraction;
    $: { interactionData; dispatch("change"); }
    let accordionItemsOpenStore: Writable<boolean[]> = writable($gameStore.data.states
        .map(stateDataFull => interactionData.states.includes(stateDataFull[0])));
    accordionItemsOpenStore.subscribe(accordionItemsOpen => {
        interactionData.states = $gameStore.data.states
            .filter((data, index) => accordionItemsOpen[index] === true)
            .map((data) => data[0]);
    });
</script>

<Flex class="h-[calc(100vh-7.75em)]" gap="sm">
    <Flex class="w-[60%]" direction="column" gap="sm">
        <Flex class="w-full min-h-[4em]" gap="md">
            <TextInput class="w-[60%]"
                label="Title" 
                placeholder="[Cut] [Ropes] with [Knife]"
                required={true} 
                error={interactionData.title.length == 0} 
                bind:value={interactionData.title} />
            <SelectAction class="w-[40%]"
                bind:selectedActionID={interactionData.action}
                on:change={() => { interactionData = interactionData }} />
        </Flex>
        <Flex class="w-[calc(100%-1em)] min-h-[4em] grow mx-[0.5em]" gap="lg">
            {@const actionDataFull = getAction(interactionData.action, $gameStore)}
            {#if actionDataFull !== undefined}
                {@const actionData = actionDataFull[1]}
                <SelectMultipleComponents class="w-[calc(50%-0.5em)]"
                    bind:selectedComponentIDs={interactionData.args[0]}
                    label={actionData.two ? "Components #1" : "Components"}
                    on:change={() => { interactionData = interactionData }} />
                {#if actionData.two === true}
                    <SelectMultipleComponents class="w-[calc(50%-0.5em)]"
                        bind:selectedComponentIDs={interactionData.args[1]}
                        label="Components #2"
                        on:change={() => { interactionData = interactionData }} />
                {/if}
            {/if}
        </Flex>
        <Text class="text-center" 
            size="sm" weight="semibold">
            (For order doesn't matter, component sets 1 and 2 are interchangeable)
        </Text>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[40%]" direction="column">
        <Flex class="h-[60%]" direction="column">
            <TextLabel class="mb-[0.25em]">Active States (Normal)</TextLabel>
            <Accordion class="accordion accordion-select grow"
                multiple={true}>
                {#each $gameStore.data.states as [stateID, stateData], index}
                    {#if stateData.type === "normal"}
                        <AccordionItem transitionType="slide" transitionParams={{ duration: 200 }}
                            bind:open={$accordionItemsOpenStore[index]}>
                            <Flex slot="header" 
                                direction="row" 
                                justify="space-between">
                                <Text class="min-h-[1.5em]" size="md">
                                    {#key $bundleValidStore}
                                        {stateData.title}
                                    {/key}
                                </Text>
                            </Flex>
                        </AccordionItem>
                    {/if}
                {/each}
            </Accordion>
        </Flex>
        <Divider orientation="horizontal" />
        <Textarea class="grow textarea-auto"
            label="Notes" 
            placeholder={"Knife should only be available to cut rope when:\n"
                + "- It's within reach, having been knocked from the shelf (flag 'knife_reachable' = true)\n"
                + "- Taped mitts have been removed from hands (no mitts restraint equipped / flag 'nomitts' = true)"}
            bind:value={interactionData.notes} />
    </Flex>
</Flex>