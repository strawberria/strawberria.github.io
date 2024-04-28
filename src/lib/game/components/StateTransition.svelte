<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";
    import { Button, Divider, Flex, Text, TypographyProvider } from "@svelteuidev/core";
    import { lookupStore, progressSetState, progressStore } from "$lib/game/functions/progress";
    import type { GameData } from "$lib/global/functions/typings";

    export let gameData: GameData;
</script>

<Flex class="h-full w-full p-[0.5em] items-center center" gap="md">
    {@const currentStateData = $lookupStore.states[$progressStore.state]}
    {@const currentStateImage = $lookupStore.images[currentStateData.image]}
    <!-- Display the current image if valid -->
    {#if currentStateImage !== undefined}
        <img class="object-contain !h-full max-w-[50%] py-[1em]"
            src={currentStateImage.base64} />
        <Divider orientation="vertical" />
    {:else}
        <div class="grow" />
    {/if}

    <!-- Anchor to prevent height from expanding outside viewport -->
    <div class="h-full grow relative">
        <Flex class={`absolute inset-0 center items-center overflow-y-auto`} 
            direction="column">
            {#if currentStateData.type === "opening"}
                <!-- Display the opening header -->
                <Flex justify="center" gap="xs">
                    <Text class="text-2xl" weight="semibold">{gameData.metadata.title}</Text>
                    <Text class="text-2xl" weight="semibold" color="$blue400">│</Text>
                    <Text class="text-2xl" weight="semibold">Version {gameData.metadata.version}</Text>
                    <Text class="text-2xl" weight="semibold" color="$blue400">│</Text>
                    <Text class="text-2xl" weight="semibold">@{gameData.metadata.developer}</Text>
                </Flex>
            {/if}
    
            <!-- Display the text for the state -->
            <Divider class="w-full" />
            <TypographyProvider class="space-y-[1em]">
                <SvelteMarkdown source={currentStateData.description
                    .replaceAll("\n", "\n\n")}/>
            </TypographyProvider>
            <Divider class="w-full" />
    
            <!-- Display the buttons depending on the state -->
            {#if currentStateData.type !== "choice"}
                <Button class="shrink-0 mb-[0.5em] rounded-lg" color="gray"
                    on:click={() => { progressSetState(currentStateData.nextState) }}>
                    Continue
                </Button>
            {/if}
        </Flex>
    </div>
</Flex>