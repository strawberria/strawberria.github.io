<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentObject from "$lib/development/components/CurrentObject.svelte";
    import { gameStore, currentObjectIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameObject } from "$lib/global/functions/typings";

    // Store current object for selection purposes
    let currentObjectIndex: number | undefined;
    let currentObjectData: GameObject | undefined;
    let objectAccordionOpenStore: Writable<boolean[]> = writable([]);
    currentObjectIDStore.subscribe(id => {
        const currentObjectIndexRaw = $gameStore.data.objects.findIndex(([_id, _]) => _id === id);
        currentObjectIndex = currentObjectIndexRaw !== -1
            ? currentObjectIndexRaw : undefined; // -1 for invalid
        currentObjectData = currentObjectIndex !== undefined
            ? $gameStore.data.objects[currentObjectIndex][1] : undefined;
    });

    // Handlers for individual game objects
    function createObject(): [string, GameObject] {
        const objectID = randomID("object");
        return [objectID, { name: "New Object", examine: "", tags: [] }];
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game objects -->
        <AccordionHeader label="Objects"
            accordionOpenStore={objectAccordionOpenStore}
            currentIDStore={currentObjectIDStore}
            orderedData={$gameStore.data.objects}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createObject} />
        <Accordion class="accordion accordion-select grow">
            {#each $gameStore.data.objects as [objectID, objectData], index}
                <AccordionItem class={$bundleValidStore["objects"]["objects"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$objectAccordionOpenStore[index]}>
                    <Flex slot="header" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {objectData.name}
                            {/key}
                        </Text>
                    </Flex>
                </AccordionItem>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        {#if currentObjectIndex !== undefined && $currentObjectIDStore !== undefined
            && currentObjectData !== undefined}
            <CurrentObject bind:objectIndex={currentObjectIndex}
                bind:objectID={$currentObjectIDStore}
                bind:objectData={currentObjectData} />
        {/if}
    </Flex>
</Flex>