<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentRestraint from "$lib/development/components/CurrentRestraint.svelte";
    import { gameStore, currentRestraintIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameRestraint } from "$lib/global/functions/typings";

    // Store current restraint for selection purposes
    let currentRestraintIndex: number | undefined;
    let currentRestraintData: GameRestraint | undefined;
    let restraintAccordionOpenStore: Writable<boolean[]> = writable([]);
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
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game restraints -->
        <AccordionHeader label="Restraints"
            accordionOpenStore={restraintAccordionOpenStore}
            currentIDStore={currentRestraintIDStore}
            orderedData={$gameStore.data.restraints}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createRestraint} />
        <Accordion class="accordion accordion-select grow">
            {#each $gameStore.data.restraints as [restraintID, restraintData], index}
                <AccordionItem class={$bundleValidStore["restraints"]["restraints"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$restraintAccordionOpenStore[index]}>
                    <Flex slot="header" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {restraintData.name}
                            {/key}
                        </Text>
                    </Flex>
                </AccordionItem>
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