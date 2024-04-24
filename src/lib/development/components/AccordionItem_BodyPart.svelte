<script lang="ts">
    import { Flex, TextInput, Textarea } from "@svelteuidev/core";
    import type { GameBodyPart } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";
    import SelectComponent from "$lib/development/components/SelectComponent.svelte";

    export let bodyPartData: GameBodyPart;
    $: { bodyPartData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <!-- Version, version title, and changelog text -->
    <TextInput label="Body Part Name" 
        placeholder="Hands"
        required={true} 
        error={bodyPartData.name.length == 0} 
        bind:value={bodyPartData.name} />
    <SelectComponent label="Initial Restraint"
        bind:selectedComponentID={bodyPartData.initial}
        noError={true}
        excludeBodyParts={true}
        excludeObjects={true} />
</Flex>