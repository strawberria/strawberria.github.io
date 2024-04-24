<script lang="ts">
    import { Flex, Switch, TextInput } from "@svelteuidev/core";
    import SelectImage from "./SelectImage.svelte";
    import type { GameLocation } from "../functions/typings";
    import { validate } from "../functions/validation";

    export let locationData: GameLocation;
    $: { locationData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <!-- Location name, junction data (whether to use, ordered, junction) -->
    <TextInput label="Name" 
        placeholder="Unlock"
        required={true} 
        error={locationData.name.length == 0} 
        bind:value={locationData.name} />
    <SelectImage bind:selectedImageID={locationData.imageID} />
    <Flex class="h-[36px]" align="center">
        <Switch label="Initially Accessible"
            bind:checked={locationData.initial} />
    </Flex>
</Flex>