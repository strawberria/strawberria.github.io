<script lang="ts">
    import { ActionIcon, Divider, Flex, Text, TypographyProvider } from "@svelteuidev/core";
    import { ArrowClockwise, ArrowCounterclockwise, ArrowLeft } from "svelte-bootstrap-icons";
    import SvelteMarkdown from "svelte-markdown";
    import NormalMinimap from "$lib/game/components/NormalMinimap.svelte";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";
    import { playingGameStore } from "$lib/development/functions/project";
    import type { GameData } from "$lib/global/functions/typings";

    export let gameData: GameData;
</script>

<Flex class="h-full w-full p-[0.5em]" gap="sm">
    {@const currentStateData = $lookupStore.states[$progressStore.state]}
    {@const currentStateImage = $lookupStore.images[currentStateData.image]}
    <Flex class="w-[30%]" direction="column">
        <!-- Show the action bar including back, undo, etc. -->
        <Flex class="w-full mb-[0.625em]" gap="xs">
            <ActionIcon variant="light"
                on:click={() => { $playingGameStore = undefined; }}>
                <ArrowLeft />
            </ActionIcon>
            <div class="grow" />
            <ActionIcon variant="light"
                on:click={() => { $playingGameStore = undefined; }}>
                <ArrowCounterclockwise />
            </ActionIcon>
            <ActionIcon variant="light"
                on:click={() => { $playingGameStore = undefined; }}>
                <ArrowClockwise />
            </ActionIcon>
        </Flex>
        <Divider class="mt-0 w-full"
            orientation="horizontal" /> 
        <!-- Displays the current state image along with a space for hints -->
        <img class="max-w-full max-h-[calc(100%-20em)] object-contain"
            src={currentStateImage.base64} />
        <Divider class="mb-[0.625em] w-full"
            orientation="horizontal" /> 
        <!-- Reserve space for hints - 1 line worth? -->
        <Flex class="w-full mx-[1em]" gap="lg">
            <Text>Hint 1</Text>
            <Text>Hint 2</Text>
        </Flex>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column">
        <Flex class="h-[60%]" direction="row" gap="sm">
            <Flex class="w-[60%] h-full" direction="column" gap="xs">
                <!-- Display the description for the current state, scrollable? -->
                <TypographyProvider class="space-y-[1em] overflow-y-auto">
                    {#each { length: 10 } as _}
                    <SvelteMarkdown source={currentStateData.description
                        .replaceAll("\n", "\n\n")}/>
                    {/each}
                </TypographyProvider>
            </Flex>
            <Divider orientation="vertical" /> 
            <Flex class="w-[40%] h-full" direction="column" gap="xs">
                <NormalMinimap gameData={gameData} />
            </Flex>
        </Flex>
        <Divider orientation="horizontal" /> 
        <Flex class="h-[40%]" direction="row" gap="sm">
            <!-- Current restraints -->
            <Flex class="w-[30%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Current Restraints
                </Text>
            </Flex>
            <Divider orientation="vertical" /> 
            <!-- Found objects -->
            <Flex class="w-[50%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Available Objects
                </Text>
            </Flex>
            <Divider orientation="vertical" /> 
            <!-- Actions -->
            <Flex class="w-[20%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Actions
                </Text>
            </Flex>
        </Flex>
    </Flex>
</Flex>