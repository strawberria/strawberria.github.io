<script lang="ts">
    import { Flex } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { handleClick } from "$lib/game/functions/evaluate";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";

    const maxCharacters = Math.max(...$gameStore.data.objects
        .map(objectDataFull => objectDataFull[1].name.length));
</script>

<div class="grow w-full objects-grid">
    {#each $progressStore.objects as objectID}
        {@const objectData = $lookupStore.objects[objectID]}
        <Flex style={`width: ${maxCharacters / 1.5}em`}
            justify="center">
            <!-- Why div instead of Text? -->
            <div class="text-center text-highlight"
                class:text-newcomp={$progressStore.newComps.includes(objectID)}
                on:click={() => { handleClick(objectID, "component") }}>
                {objectData.display}
            </div>
        </Flex>
    {/each}
</div>

<style>
    .objects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, 10em);
        grid-auto-rows: 1.5em;
        grid-gap: 0.5em;
        justify-content: space-around;
    }
</style>