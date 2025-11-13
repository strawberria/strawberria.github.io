<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";
    import { Button, Divider, Flex, Text, TypographyProvider } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { initializeGame, lookupStore, progressSetState, progressStore, restoreUndo } from "$lib/game/functions/progress";
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
        <Flex class={`absolute inset-0 center overflow-y-auto ${currentStateData.type === "choice" 
            ? "items-start" : "items-center"}`} 
            direction="column">
            {#if currentStateData.type === "opening"}
                <!-- Display the opening header -->
                <Flex justify="center" gap="xs">
                    <Text class="text-2xl" weight="semibold">{$gameStore.metadata.title}</Text>
                    <Text class="text-2xl" weight="semibold" color="$blue400">│</Text>
                    <Text class="text-2xl" weight="semibold">Version {$gameStore.metadata.version}</Text>
                    <Text class="text-2xl" weight="semibold" color="$blue400">│</Text>
                    <Text class="text-2xl" weight="semibold">@{$gameStore.metadata.developer}</Text>
                </Flex>
                <Divider class="w-full" />
            {/if}
    
            <!-- Display the text for the state -->
            <TypographyProvider class="space-y-[0.5em]">
                <SvelteMarkdown source={currentStateData.description
                    .replaceAll("\n", "\n\n")}/>
            </TypographyProvider>
            <Divider class="w-full" />
    
            <!-- Display the buttons depending on the state -->
            {#if currentStateData.type === "opening" || currentStateData.type === "transition"}
                <Button class="shrink-0 mb-[0.5em] rounded-lg" color="gray"
                    on:click={() => { progressSetState(currentStateData.nextState) }}>
                    Continue
                </Button>
            {:else if currentStateData.type === "choice"}
                <!-- Only render the choices which are currently available -->
                <!-- (this also includes choices without key or value) -->
                {#each currentStateData.choices as [choiceID, choiceData], index}
                    {#if choiceData.flagKey === "" || choiceData.flagVal === ""
                        || $progressStore.flags[choiceData.flagKey] === choiceData.flagVal}
                        <Text class="text-highlight ml-[0.5em] mb-[0.25em]"
                            on:click={() => { progressSetState(choiceData.state) }}>
                            <span class="mr-[0.25em]">➤</span> {choiceData.text}
                        </Text>
                    {/if}
                {/each}
            {:else if currentStateData.type === "ending"}
                <!-- If normal ending, then button to restart -->
                <Button class="shrink-0 mb-[0.5em] rounded-lg" color="gray"
                    on:click={() => { initializeGame() }}>
                    Restart
                </Button>
            {:else if currentStateData.type === "bad_end"}
                <!-- If bad end, show button to undo -->
                <Button class="shrink-0 mb-[0.5em] rounded-lg" color="gray"
                    on:click={() => { restoreUndo() }}>
                    Try Again
                </Button>
            {/if}
        </Flex>
    </div>
</Flex>