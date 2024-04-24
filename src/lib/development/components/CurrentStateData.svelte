<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Accordion, Divider, Flex, NativeSelect, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import AccordionHeader from "./AccordionHeader.svelte";
    import AccordionItem_Choice from "./AccordionItem_Choice.svelte";
    import AccordionItem_Hint from "./AccordionItem_Hint.svelte";
    import ErrorMessage from "./ErrorMessage.svelte";
    import SelectState from "./SelectState.svelte";
    import { bundleValidStore } from "../functions/project";
    import { stateTypeSelectData, type GameState, type GameStateHint, type GameStateChoice } from "../functions/typings";
    import { validate } from "../functions/validation";
    import SelectImage from "./SelectImage.svelte";

    export let stateIndex: number;
    export let stateID: string;
    export let stateData: GameState;
    $: { stateData; validate(); }
    const currentHintIDStore: Writable<string | undefined> = writable(undefined);
    const currentChoiceIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for hints within a state
    function createHint(): [string, GameStateHint] {
        const hintID = randomID("hint");
        return [hintID, { title: "New Hint", attempts: 1, text: "" }];
    }
    function hintOnChange(event: CustomEvent<string | string[] | null>) {
        $currentHintIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }

    // Handlers for choices within a state
    function createChoice(): [string, GameStateChoice] {
        const choiceID = randomID("choice");
        return [choiceID, { text: "New Choice", state: "", flagKey: "", flagVal: "" }];
    }
    function choiceOnChange(event: CustomEvent<string | string[] | null>) {
        $currentChoiceIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="h-[calc(100vh-7.75em)]" gap="sm">
    <Flex class="w-[50%]" direction="column" gap="xs">
        <Flex class="w-full" gap="md">
            <TextInput class="w-[65%]"
                label="Title" 
                placeholder="Abruptly Awoken"
                required={true} 
                error={stateData.title.length == 0} 
                bind:value={stateData.title} />
            <NativeSelect class="w-[35%]"
                label="Type"
                data={stateTypeSelectData}
                on:change={() => { stateData = stateData }}
                bind:value={stateData.type} />
        </Flex>
        <SelectImage class="w-[50%]" 
            bind:selectedImageID={stateData.image} />
        <Textarea class="grow-[2] textarea-auto"
            label="Description (Markdown)" 
            placeholder={
                "Katie was abruptly roused from her sleep by a resounding slam, head pounding and surroundings completely darkened... "
                + "With a groan, she attempted to rub away the sleepiness- only to be interrupted by the sound of clanging metal from her wrists!?"
            }
            required={true} 
            error={stateData.description.length == 0} 
            bind:value={stateData.description} />
        <Textarea class="grow textarea-auto"
            label="Notes" 
            placeholder="Opening sequence, restraints: blindfold, ball gag, collar chained to pipe, handcuffs, leg cuffs"
            bind:value={stateData.notes} />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[50%]" direction="column">
        {#if stateData.type === "choice"}
            <!-- Accordion for choices -->
            <Flex class="h-1/2" direction="column" gap="xs">
                <AccordionHeader label="Choices"
                    currentIDStore={currentChoiceIDStore}
                    orderedData={stateData.choices}
                    callback={() => { stateData = stateData }}
                    callbackCreate={createChoice} />
                <Accordion class="overflow-auto grow"
                    defaultValue={undefined}
                    on:change={choiceOnChange}>
                    {#each stateData.choices as [choiceID, choiceData], index}
                        {@const choicesValidData = $bundleValidStore["states"]["choices"][stateIndex]}
                        <Accordion.Item 
                            class={choicesValidData[index] 
                                ? "item-valid" : "item-error"}
                            value={choiceID}>
                            <Text slot="control" class="min-h-[1.5em]" size="md">
                                {#key $bundleValidStore}
                                    {choiceData.text}
                                {/key}
                            </Text>
                            <AccordionItem_Choice choiceData={choiceData}
                                stateID={stateID} />
                        </Accordion.Item>
                    {/each}
                </Accordion>
                <ErrorMessage show={stateData.choices.length === 0}
                    text="There should be at least one choice available!" />
            </Flex>
            <Divider orientation="horizontal" />  
        {:else if stateData.type === "opening" || stateData.type === "transition"}
            <SelectState bind:selectedStateID={stateData.nextState}
                label="Next State"
                exclude={[stateID]}
                on:change={() => { stateData = stateData }} />
            <Divider orientation="horizontal" />  
        {/if}
        <AccordionHeader label="Hints"
            currentIDStore={currentHintIDStore}
            orderedData={stateData.hints}
            callback={() => { stateData = stateData }}
            callbackCreate={createHint} />
        <Accordion class="overflow-auto h-1/2 mt-[0.625em]"
            defaultValue={undefined}
            on:change={hintOnChange}>
            {#each stateData.hints as [hintID, hintData], index}
                {@const hintsValidData = $bundleValidStore["states"]["hints"][stateIndex]}
                <Accordion.Item 
                    class={hintsValidData[index] 
                        ? "item-valid" : "item-error"}
                    value={hintID}>
                    <Text slot="control" class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {hintData.title}
                        {/key}
                    </Text>
                    <AccordionItem_Hint bind:hintData={hintData} />
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
</Flex>