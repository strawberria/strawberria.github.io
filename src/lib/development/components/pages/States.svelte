<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentState from "$lib/development/components/CurrentState.svelte";
    import ErrorMessage from "$lib/development/components/ErrorMessage.svelte";
    import { gameStore, currentStateIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameState } from "$lib/global/functions/typings";

    // Store current state for selection purposes
    let currentStateIndex: number | undefined;
    let currentStateData: GameState | undefined;
    let stateAccordionOpenStore: Writable<boolean[]> = writable([]);
    currentStateIDStore.subscribe(id => {
        const currentStateIndexRaw = $gameStore.data.states.findIndex(([_id, _]) => _id === id);
        currentStateIndex = currentStateIndexRaw !== -1
            ? currentStateIndexRaw : undefined; // -1 for invalid
        currentStateData = currentStateIndex !== undefined
            ? $gameStore.data.states[currentStateIndex][1] : undefined;
    });

    // Handlers for individual game states
    function createState(): [string, GameState] {
        const stateID = randomID("state");
        return [stateID, { title: "New State", type: "normal", image: "",
            description: "", notes: "",  hints: [], nextState: "", choices: [] }];
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game states -->
        <AccordionHeader label="States"
            accordionOpenStore={stateAccordionOpenStore}
            currentIDStore={currentStateIDStore}
            orderedData={$gameStore.data.states}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createState} />
        <Accordion class="accordion accordion-select grow">
            {#each $gameStore.data.states as [stateID, stateData], index}
                <AccordionItem class={$bundleValidStore["states"]["states"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$stateAccordionOpenStore[index]}>
                    <Flex slot="header" 
                        direction="row" 
                        justify="space-between">
                        {#key $bundleValidStore}
                            <Text class="min-h-[1.5em]" size="md">
                                {stateData.title}
                            </Text>
                            {#if stateData.type !== "normal"}
                                <Text class="min-h-[1.5em] mr-[0.5em]" size="md"
                                    weight="semibold">
                                    {stateData.type[0].toUpperCase()}
                                </Text>
                            {/if}
                        {/key}
                    </Flex>
                </AccordionItem>
            {/each}
        </Accordion>
        <ErrorMessage show={$bundleValidStore["states"]["hasState"] === false}
            text="There should be at least one state!" />
        <ErrorMessage show={$bundleValidStore["states"]["hasState"] === true &&
            $bundleValidStore["states"]["hasOpening"] === false}
            text="There should be exactly one opening state!" />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        <CurrentState bind:stateIndex={currentStateIndex}
            bind:stateID={$currentStateIDStore}
            bind:stateData={currentStateData} />
    </Flex>
</Flex>