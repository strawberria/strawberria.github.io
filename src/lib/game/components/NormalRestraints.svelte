<script lang="ts">
    import { Flex, Text } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { handleClick } from "$lib/game/functions/evaluate";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";
</script>

<Flex class="w-full grow" direction="column">
    {#each $gameStore.data.bodyParts as [bodyPartID, bodyPartData]}
        {@const restraintID = $progressStore.restraints[bodyPartID]}
        <Flex class="w-full" justify="space-between">
            <Text class="text-highlight"
                on:click={() => { handleClick(bodyPartID, "component", false) }}>
                {bodyPartData.display}
            </Text>
            <!-- Display current restraint if not undefined -->
            {#if restraintID !== undefined}
                {@const restraintData = $lookupStore.restraints[restraintID]}
                <Text class={`text-highlight ${
                    $progressStore.newComps.includes(restraintID) ? "text-newcomp" : ""}`}
                    on:click={() => { handleClick(restraintID, "component") }}>
                    {#if $progressStore.needReveal.includes(restraintID)}
                        ???
                    {:else}
                        {restraintData.display}
                    {/if}
                </Text>
            {/if}
        </Flex>
    {/each}
</Flex>