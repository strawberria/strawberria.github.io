<script lang="ts">
    import { Accordion, Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import AccordionHeader from "../AccordionHeader.svelte";
    import CurrentObject from "../CurrentObject.svelte";
    import { gameStore, currentObjectIDStore, bundleValidStore } from "../../functions/project";
    import type { GameObject } from "../../functions/typings";

    // Store current object for selection purposes
    let currentObjectIndex: number | undefined;
    let currentObjectData: GameObject | undefined;
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
    function objectOnChange(event: CustomEvent<string | string[] | null>) {
        $currentObjectIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game objects -->
        <AccordionHeader label="Objects"
            currentIDStore={currentObjectIDStore}
            orderedData={$gameStore.data.objects}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createObject} />
        <Accordion class="overflow-auto h-full accordion-select"
            defaultValue={undefined}
            on:change={objectOnChange}>
            {#each $gameStore.data.objects as [objectID, objectData], index}
                <Accordion.Item class={$bundleValidStore["objects"]["objects"][index] 
                        ? "item-valid" : "item-error"}
                    value={objectID}>
                    <Flex slot="control" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {objectData.name}
                            {/key}
                        </Text>
                    </Flex>
                </Accordion.Item>
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