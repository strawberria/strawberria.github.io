<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentInteraction from "$lib/development/components/CurrentInteraction.svelte";
    import { gameStore, currentInteractionIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameInteraction } from "$lib/global/functions/typings";

    // Store current interaction for selection purposes
    let currentInteractionIndex: number | undefined;
    let currentInteractionData: GameInteraction | undefined;
    let interactionAccordionOpenStore: Writable<boolean[]> = writable([]);
    currentInteractionIDStore.subscribe(id => {
        const currentInteractionIndexRaw = $gameStore.data.interactions.findIndex(([_id, _]) => _id === id);
        currentInteractionIndex = currentInteractionIndexRaw !== -1
            ? currentInteractionIndexRaw : undefined; // -1 for invalid
        currentInteractionData = currentInteractionIndex !== undefined
            ? $gameStore.data.interactions[currentInteractionIndex][1] : undefined;
    });

    // Handlers for individual game interactions
    function createInteraction(): [string, GameInteraction] {
        const interactionID = randomID("interaction");
        return [interactionID, { title: "New Interaction", action: "", args: [[], []],
            notes: "", nodes: [], states: [] }];
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column">
        <!-- Game interactions -->
        <Flex direction="column" gap="xs">
            <AccordionHeader label="Interactions"
                bind:accordionOpenStore={interactionAccordionOpenStore}
                currentIDStore={currentInteractionIDStore}
                orderedData={$gameStore.data.interactions}
                callback={() => { $gameStore = $gameStore }}
                callbackCreate={createInteraction} />
            <Accordion class="accordion accordion-select grow">
                {#each $gameStore.data.interactions as [interactionID, interactionData], index}
                    <AccordionItem class={$bundleValidStore["interactions"]["interactions"][index] 
                            ? "item-valid" : "item-error"}
                        transitionType="slide" transitionParams={{ duration: 200 }}
                        bind:open={$interactionAccordionOpenStore[index]}>
                        <Flex slot="header" 
                            direction="row" 
                            justify="space-between">
                            <Text class="min-h-[1.5em]" size="md">
                                {#key $bundleValidStore}
                                    {interactionData.title}
                                {/key}
                            </Text>
                        </Flex>
                    </AccordionItem>
                {/each}
            </Accordion>
        </Flex>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column">
        <CurrentInteraction interactionIndex={currentInteractionIndex}
            interactionID={$currentInteractionIDStore}
            interactionData={currentInteractionData} />
    </Flex>
</Flex>