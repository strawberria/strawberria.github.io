<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Accordion, Divider, Flex, Text, TextInput, Textarea } from "@svelteuidev/core";
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

    // Should only have string[] since multiple
    function stateOnChange(event: CustomEvent<string | string[] | null>) {
        interactionData.states = event.detail as string[];
    }
</script>

<Flex class="h-[calc(100vh-7.75em)]" gap="sm">
    <Flex class="w-[60%]" direction="column" gap="xs">
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
        <Flex class="w-full min-h-[4em] grow" gap="md">
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
            <TextLabel class="mb-[0.25em]">Active States</TextLabel>
            <Accordion class="overflow-auto h-full accordion-select"
                defaultValue={undefined}
                multiple={true}
                on:change={stateOnChange}>
                {#each $gameStore.data.states as [stateID, stateData], index}
                    <Accordion.Item value={stateID}>
                        <Flex slot="control" 
                            direction="row" 
                            justify="space-between">
                            <Text class="min-h-[1.5em]" size="md">
                                {#key $bundleValidStore}
                                    {stateData.title}
                                {/key}
                            </Text>
                            {#if stateData.type !== "normal"}
                                <Text class="min-h-[1.5em] mr-[0.5em]" size="md"
                                    weight="semibold">
                                    {stateData.type[0].toUpperCase()}
                                </Text>
                            {/if}
                        </Flex>
                    </Accordion.Item>
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