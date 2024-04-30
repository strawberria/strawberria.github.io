<script lang="ts">
    import { Flex, TextInput } from "@svelteuidev/core";
    import SelectState from "$lib/development/components/SelectState.svelte";
    import type { GameStateChoice } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let choiceData: GameStateChoice;
    $: { choiceData; validate(); }
    export let stateID: string;
</script>

<Flex direction="column" gap="xs">
    <!-- Version, version title, and changelog text -->
    <TextInput class="w-full"
        label="Text" 
        placeholder="Smash the ceramic vase!"
        required={true} 
        error={choiceData.text.length == 0} 
        bind:value={choiceData.text} />
    <SelectState bind:selectedStateID={choiceData.state}
        exclude={[stateID]} />
    <Flex class="w-full" gap="md">
        <TextInput class="w-full"
            label="Flag Key (Optional)" 
            placeholder="found_taser"
            error={choiceData.flagKey !== "" ? choiceData.flagVal === "" : false} 
            bind:value={choiceData.flagKey} />
        <TextInput class="w-full"
            label="Flag Value (Optional)" 
            placeholder="true"
            error={choiceData.flagKey !== "" ? choiceData.flagVal === "" : false} 
            bind:value={choiceData.flagVal} />
    </Flex>
</Flex>