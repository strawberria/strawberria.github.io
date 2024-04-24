<script lang="ts">
    import { initializeGame } from "$lib/game/functions/progress";
    import type { GameData } from "$lib/global/functions/typings";
    import { Divider, Flex, Text } from "@svelteuidev/core";

    export let gameData: GameData;

    // Calculate the maximum number of hints
    const maxHints = Math.max(...gameData.data.states
        .map(stateDataFull => stateDataFull[1].hints.length));

    initializeGame(gameData); // Race condition: faster than onMount?
</script>

<!-- Overlay over current container, page or poup-->
<div class="absolute inset-0 z-20">
    <Flex class="!h-[calc(100%)]" justify="space-between" gap="sm">
        <Flex class="w-[30%]" direction="column" gap="xs">
            <!-- Displays the current state image, description, and a space for hints -->

            <Divider orientation="horizontal" /> 
            <Text>Hint 1</Text>
        </Flex>
        <Divider orientation="vertical" /> 
        <Flex class="w-[40%]" direction="column" gap="xs">
            
        </Flex>
        <Divider orientation="vertical" /> 
        <Flex class="w-[30%]" direction="column">
            
        </Flex>
    </Flex>
</div>
