<script lang="ts">
    import { Accordion, Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import AccordionHeader from "../AccordionHeader.svelte";
    import CurrentState from "../CurrentState.svelte";
    import ErrorMessage from "../ErrorMessage.svelte";
    import { gameStore, currentStateIDStore, bundleValidStore } from "../../functions/project";
    import type { GameState } from "../../global/functions/typings";

    // Store current state for selection purposes
    let currentStateIndex: number | undefined;
    let currentStateData: GameState | undefined;
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
    function stateOnChange(event: CustomEvent<string | string[] | null>) {
        $currentStateIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game states -->
        <AccordionHeader label="States"
            currentIDStore={currentStateIDStore}
            orderedData={$gameStore.data.states}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createState} />
        <Accordion class="overflow-auto h-full accordion-select"
            defaultValue={undefined}
            on:change={stateOnChange}>
            {#each $gameStore.data.states as [stateID, stateData], index}
                <Accordion.Item 
                    class={$bundleValidStore["states"]["states"][index] 
                        ? "item-valid" : "item-error"}
                    value={stateID}>
                    <Flex slot="control" 
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
                </Accordion.Item>
            {/each}
        </Accordion>
        <ErrorMessage show={$bundleValidStore["states"]["opening"] === false}
            text="There should be exactly one opening state!" />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        <CurrentState bind:stateIndex={currentStateIndex}
            bind:stateID={$currentStateIDStore}
            bind:stateData={currentStateData} />
    </Flex>
</Flex>