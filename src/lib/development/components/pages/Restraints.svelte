<script lang="ts">
    import { Accordion, Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentRestraint from "$lib/development/components/CurrentRestraint.svelte";
    import { gameStore, currentRestraintIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameRestraint } from "$lib/global/functions/typings";

    // Store current restraint for selection purposes
    let currentRestraintIndex: number | undefined;
    let currentRestraintData: GameRestraint | undefined;
    currentRestraintIDStore.subscribe(id => {
        const currentRestraintIndexRaw = $gameStore.data.restraints.findIndex(([_id, _]) => _id === id);
        currentRestraintIndex = currentRestraintIndexRaw !== -1
            ? currentRestraintIndexRaw : undefined; // -1 for invalid
        currentRestraintData = currentRestraintIndex !== undefined
            ? $gameStore.data.restraints[currentRestraintIndex][1] : undefined;
    });

    // Handlers for individual game restraints
    function createRestraint(): [string, GameRestraint] {
        const restraintID = randomID("restraint");
        return [restraintID, { name: "New Restraint", examine: "", bodyPart: "", tags: [] }];
    }
    function restraintOnChange(event: CustomEvent<string | string[] | null>) {
        $currentRestraintIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game restraints -->
        <AccordionHeader label="Restraints"
            currentIDStore={currentRestraintIDStore}
            orderedData={$gameStore.data.restraints}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createRestraint} />
        <Accordion class="overflow-auto h-full accordion-select"
            defaultValue={undefined}
            on:change={restraintOnChange}>
            {#each $gameStore.data.restraints as [restraintID, restraintData], index}
                <Accordion.Item class={$bundleValidStore["restraints"]["restraints"][index] 
                        ? "item-valid" : "item-error"}
                    value={restraintID}>
                    <Flex slot="control" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {restraintData.name}
                            {/key}
                        </Text>
                    </Flex>
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        {#if currentRestraintIndex !== undefined && $currentRestraintIDStore !== undefined
            && currentRestraintData !== undefined}
            <CurrentRestraint bind:restraintIndex={currentRestraintIndex}
                bind:restraintID={$currentRestraintIDStore}
                bind:restraintData={currentRestraintData} />
        {/if}
    </Flex>
</Flex>