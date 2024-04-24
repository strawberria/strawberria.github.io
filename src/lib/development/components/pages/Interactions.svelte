<script lang="ts">
    import { Accordion, Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentInteraction from "$lib/development/components/CurrentInteraction.svelte";
    import { gameStore, currentInteractionIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameInteraction } from "$lib/global/functions/typings";
    import { writable, type Writable } from "svelte/store";

    // Store current interaction for selection purposes
    let currentInteractionIndex: number | undefined;
    let currentInteractionData: GameInteraction | undefined;
    const renderInteractionStore: Writable<boolean> = writable(true);
    currentInteractionIDStore.subscribe(id => {
        const currentInteractionIndexRaw = $gameStore.data.interactions.findIndex(([_id, _]) => _id === id);
        currentInteractionIndex = currentInteractionIndexRaw !== -1
            ? currentInteractionIndexRaw : undefined; // -1 for invalid
        currentInteractionData = currentInteractionIndex !== undefined
            ? $gameStore.data.interactions[currentInteractionIndex][1] : undefined;
        
        // Force weird artificial delay - blame tabs
        // $renderInteractionStore = false;
        // setTimeout(() => { $renderInteractionStore = true }, 200);
    });

    // Handlers for individual game interactions
    function createInteraction(): [string, GameInteraction] {
        const interactionID = randomID("interaction");
        return [interactionID, { title: "New Interaction", action: "", args: [[], []],
            notes: "", nodes: [], states: [] }];
    }
    function interactionOnChange(event: CustomEvent<string | string[] | null>) {
        $currentInteractionIDStore = undefined;
        $currentInteractionIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column">
        <!-- Game interactions -->
        <Flex direction="column" gap="xs">
            <AccordionHeader label="Interactions"
                currentIDStore={currentInteractionIDStore}
                orderedData={$gameStore.data.interactions}
                callback={() => { $gameStore = $gameStore }}
                callbackCreate={createInteraction} />
            <Accordion class="overflow-auto h-full accordion-select"
                defaultValue={undefined}
                on:change={interactionOnChange}>
                {#each $gameStore.data.interactions as [interactionID, interactionData], index}
                    <Accordion.Item
                        class={$bundleValidStore["interactions"]["interactions"][index] 
                            ? "item-valid" : "item-error"}
                        value={interactionID}>
                        <Flex slot="control" 
                            direction="row" 
                            justify="space-between">
                            <Text class="min-h-[1.5em]" size="md">
                                {#key $bundleValidStore}
                                    {interactionData.title}
                                {/key}
                            </Text>
                        </Flex>
                    </Accordion.Item>
                {/each}
            </Accordion>
        </Flex>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column">
        <!-- For tabs to work properly -->
        {#if $renderInteractionStore === true}
            <CurrentInteraction interactionIndex={currentInteractionIndex}
                interactionID={$currentInteractionIDStore}
                interactionData={currentInteractionData} />
        {/if}
    </Flex>
</Flex>