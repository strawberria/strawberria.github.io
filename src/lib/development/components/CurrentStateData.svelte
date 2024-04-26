<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, NativeSelect, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Choice from "$lib/development/components/AccordionItem_Choice.svelte";
    import AccordionItem_Hint from "$lib/development/components/AccordionItem_Hint.svelte";
    import ErrorMessage from "$lib/development/components/ErrorMessage.svelte";
    import SelectState from "$lib/development/components/SelectState.svelte";
    import { bundleValidStore } from "$lib/development/functions/project";
    import { stateTypeSelectData, type GameState, type GameStateHint, type GameStateChoice } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";
    import SelectImage from "$lib/development/components/SelectImage.svelte";

    export let stateIndex: number;
    export let stateID: string;
    export let stateData: GameState;
    $: { stateData; validate(); }
    let hintAccordionOpenStore: Writable<boolean[]> = writable([]);
    let choiceAccordionOpenStore: Writable<boolean[]> = writable([]);
    const currentHintIDStore: Writable<string | undefined> = writable(undefined);
    const currentChoiceIDStore: Writable<string | undefined> = writable(undefined);
    $: {
        stateID;
        $currentChoiceIDStore = undefined;
        $currentHintIDStore = undefined;    
    }

    // Handlers for hints within a state
    function createHint(): [string, GameStateHint] {
        const hintID = randomID("hint");
        return [hintID, { title: "New Hint", attempts: 1, text: "" }];
    }

    // Handlers for choices within a state
    function createChoice(): [string, GameStateChoice] {
        const choiceID = randomID("choice");
        return [choiceID, { text: "New Choice", state: "", flagKey: "", flagVal: "" }];
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
            <Flex class="grow" direction="column" gap="xs">
                <AccordionHeader label="Choices"
                    accordionOpenStore={choiceAccordionOpenStore}
                    currentIDStore={currentChoiceIDStore}
                    orderedData={stateData.choices}
                    callback={() => { stateData = stateData }}
                    callbackCreate={createChoice} />
                {#key stateID}
                    <Accordion class="accordion grow">
                        {#each stateData.choices as [choiceID, choiceData], index}
                            {@const choicesValidData = $bundleValidStore["states"]["choices"][stateIndex]}
                            <AccordionItem class={choicesValidData[index] 
                                    ? "item-valid" : "item-error"}
                                transitionType="slide" transitionParams={{ duration: 200 }}
                                bind:open={$choiceAccordionOpenStore[index]}>
                                <Text slot="header" class="min-h-[1.5em]" size="md">
                                    {#key $bundleValidStore}
                                        {choiceData.text}
                                    {/key}
                                </Text>
                                <AccordionItem_Choice choiceData={choiceData}
                                    stateID={stateID} />
                            </AccordionItem>
                        {/each}
                    </Accordion>
                {/key}
                <ErrorMessage show={stateData.choices.length === 0}
                    text="There should be at least one choice available!" />
            </Flex>
        {:else if stateData.type === "opening" || stateData.type === "transition"}
            <SelectState bind:selectedStateID={stateData.nextState}
                label="Next State"
                exclude={[stateID]}
                on:change={() => { stateData = stateData }} />
            <Divider orientation="horizontal" />  
        {/if}
        {#if stateData.type === "normal"}
            <AccordionHeader label="Hints"
                accordionOpenStore={hintAccordionOpenStore}
                currentIDStore={currentHintIDStore}
                orderedData={stateData.hints}
                callback={() => { stateData = stateData }}
                callbackCreate={createHint} />
            {#key stateID}
            <Accordion class="accordion grow mt-[0.625em]">
                {#each stateData.hints as [hintID, hintData], index}
                    {@const hintsValidData = $bundleValidStore["states"]["hints"][stateIndex]}
                    <AccordionItem class={hintsValidData[index] 
                            ? "item-valid" : "item-error"}
                        transitionType="slide" transitionParams={{ duration: 200 }}
                        bind:open={$hintAccordionOpenStore[index]}>
                        <Text slot="header" class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {hintData.title}
                            {/key}
                        </Text>
                        <AccordionItem_Hint bind:hintData={hintData} />
                    </AccordionItem>
                {/each}
            </Accordion>
            {/key}
        {/if}
    </Flex>
</Flex>