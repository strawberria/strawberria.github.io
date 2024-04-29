<script lang="ts">
    import { Flex, Text } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { handleClick } from "$lib/game/functions/evaluate";
    import { progressStore } from "$lib/game/functions/progress";
</script>

<Flex class="w-full grow" direction="column">
    <!-- Examine as well -->
    <Text class="text-highlight"
        on:click={() => { handleClick("examine", "action") }}>
        Examine
    </Text>
    {#each $gameStore.data.actions as [actionID, actionData]}
        <Text class="text-highlight"
            on:click={() => { handleClick(actionID, "action") }}>
            {actionData.name}
        </Text>
    {/each}
    <div class="grow" />
    {$progressStore.actionText}
</Flex>