<script lang="ts">
    import { type Writable, writable } from "svelte/store";
    import { Flex, TextInput } from "@svelteuidev/core";
    import SelectComponent from "$lib/development/components/SelectComponent.svelte";
    import type { GameBodyPart } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";
    import { gameStore, bundleValidStore } from "$lib/development/functions/project";

    export let bodyPartID: string;
    export let bodyPartData: GameBodyPart;
    $: { bodyPartData; validate(); }
    let excludeRestraintIDsStore: Writable<string[]> = writable([]);
    bundleValidStore.subscribe(_ => {
        $excludeRestraintIDsStore = $gameStore.data.restraints
            .filter(restraintDataFull => restraintDataFull[1].bodyPart !== bodyPartID)
            .map(restraintDataFull => restraintDataFull[0]);
    });
</script>

<!-- Cannot key because of weird behavior -->
<Flex gap="md">
    <!-- Version, version title, and changelog text -->
    <TextInput class="w-[calc(50%-0.5em)]"
        label="Display" 
        placeholder="Hands"
        required={true} 
        error={bodyPartData.display.length == 0} 
        bind:value={bodyPartData.display} />
    <!-- Existing bug where list of restraints is always one step behind, I give up -->
    <SelectComponent class="w-[calc(50%-0.5em)]"
        label="Initial Restraint"
        bind:selectedComponentID={bodyPartData.initial}
        noError={true}
        excludeBodyParts={true}
        excludeObjects={true}
        bind:excludeStore={excludeRestraintIDsStore} />
</Flex>