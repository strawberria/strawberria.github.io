<script lang="ts">
    import { ActionIcon, Divider, Flex, Text, TypographyProvider } from "@svelteuidev/core";
    import { ArrowClockwise, ArrowCounterclockwise, ArrowLeft } from "svelte-bootstrap-icons";
    import SvelteMarkdown from "svelte-markdown";
    import ClickableImage from "$lib/game/components/ClickableImage.svelte";
    import NormalActions from "$lib/game/components/NormalActions.svelte";
    import NormalMinimap from "$lib/game/components/NormalMinimap.svelte";
    import NormalObjects from "$lib/game/components/NormalObjects.svelte";
    import NormalRestraints from "$lib/game/components/NormalRestraints.svelte";
    import { lookupStore, progressStore, restoreUndo, showHint } from "$lib/game/functions/progress";
    import { gameStore, playingGameStore } from "$lib/development/functions/project";
</script>

<Flex class="h-full w-full p-[0.5em]" gap="sm">
    {@const currentStateData = $lookupStore.states[$progressStore.state]}
    {@const currentStateImage = $lookupStore.images[currentStateData.image]}
    <Flex class="w-[30%]" direction="column">
        <!-- Show the action bar including back, undo, etc. -->
        <Flex class="w-full mb-[0.625em] space-x-[0.25em]">
            <ActionIcon variant="light"
                on:click={() => { $playingGameStore = false; }}>
                <ArrowLeft />
            </ActionIcon>
            <div class="grow" />
            <Text class="w-full text-center bg-[#3f424b] py-[0.125em] !mx-[1em]">
                {$gameStore.metadata.title} │ {$gameStore.metadata.developer} │ v{$gameStore.metadata.version}
            </Text>
            <div class="grow" />
            <ActionIcon class="!ml-0" variant="light"
                on:click={() => { restoreUndo(); }}>
                <ArrowCounterclockwise />
            </ActionIcon>
            <!-- <ActionIcon variant="light"
                on:click={() => { $playingGameStore = false; }}>
                <ArrowClockwise />
            </ActionIcon> -->
        </Flex>
        <Divider class="mt-0 w-full"
            orientation="horizontal" /> 
        <!-- Displays the current state image along with a space for hints -->
        <ClickableImage class="w-full grow"
            imageData={currentStateImage} />
        <Divider class="mb-[0.625em] w-full"
            orientation="horizontal" /> 
        <!-- Reserve space for hints - 1 line worth? -->
        <Flex class="w-full m-[0.5em] min-h-[1.5em]" gap="lg">
            {#each currentStateData.hints as [hintID, hintData], index}
                {#if $progressStore.attempts >= hintData.attempts}
                    <Text class="text-highlight"
                        on:click={() => { showHint(hintData, index) }}>
                        Hint {index + 1}
                    </Text>
                {/if}
            {/each}
        </Flex>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column">
        <Flex class="h-[60%]" direction="row" gap="sm">
            <div class="w-[60%] h-full relative">
                <Flex class="absolute inset-0" direction="column" gap="xs">
                    <!-- Display the description for the current state, scrollable? -->
                    <TypographyProvider class="space-y-[1em] overflow-y-auto">
                        <SvelteMarkdown source={currentStateData.description
                            .replaceAll("\n", "\n\n")} />
                    </TypographyProvider>
                </Flex>
                <Flex class="absolute inset-0 pointer-events-none items-center" direction="column" justify="center">
                    {#if $progressStore.dialog[1] !== ""}
                        <!-- Flex doesn't like onclick -->
                        <div class="flex flex-col justify-center space-y-[0.625em] pointer-events-auto p-[1em] bg-[#3f424b] w-[80%]"
                            on:click={() => { $progressStore.dialog = ["", ""]; }}>
                            {#if $progressStore.dialog[0] !== ""}
                                <Text class="text-center py-[0.125em] px-[0.5em] border-[#c1c2c5]"
                                    style="border-width: 1px">
                                    {$progressStore.dialog[0]}
                                </Text>
                            {/if}
                            <TypographyProvider class="space-y-[1em] overflow-y-auto">
                                <SvelteMarkdown source={$progressStore.dialog[1]
                                    .replaceAll("\n", "\n\n")} />
                            </TypographyProvider>
                            <Text class="text-center" size="sm">
                                ( Click anywhere to close )
                            </Text>
                        </div>
                    {/if}
                </Flex>
            </div>
            <Divider orientation="vertical" /> 
            <Flex class="w-[40%] h-full" direction="column" gap="xs">
                <NormalMinimap />
            </Flex>
        </Flex>
        <Divider orientation="horizontal" /> 
        <Flex class="h-[40%]" direction="row" gap="sm">
            <!-- Current restraints -->
            <Flex class="w-[20%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Current Restraints
                </Text>
                <NormalRestraints />
            </Flex>
            <Divider orientation="vertical" /> 
            <!-- Found objects -->
            <Flex class="w-[60%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Accessible Objects
                </Text>
                <NormalObjects />
            </Flex>
            <Divider orientation="vertical" /> 
            <!-- Actions -->
            <Flex class="w-[20%] h-full" direction="column" gap="xs">
                <Text class="w-full text-center bg-[#3f424b] py-[0.125em]">
                    Actions
                </Text>
                <NormalActions />
            </Flex>
        </Flex>
    </Flex>
</Flex>