<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Divider, Flex, Switch, Text, TextInput } from "@svelteuidev/core";
    import SelectImage from "$lib/development/components/SelectImage.svelte";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { type GameLocation } from "$lib/global/functions/typings";
    import { getImage } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    export let locationIndex: number;
    export let locationID: string;
    export let locationData: GameLocation;
    $: { locationData; dispatch("change") }

    // Get image from location, hopefully valid?
    let previousImageSize = -1;
    let imageDataFull = getImage(locationData.image, $gameStore);
    bundleValidStore.subscribe(_ => {
        const newImageDataFull = getImage(locationData.image, $gameStore);
        if(imageDataFull !== newImageDataFull) {
            previousImageSize = -1;
            imageDataFull = newImageDataFull;
        } else if((imageDataFull !== undefined && newImageDataFull !== undefined
            && newImageDataFull[1].base64.length != previousImageSize)) {
            previousImageSize = newImageDataFull[1].base64.length;
            imageDataFull = newImageDataFull;
        }
    });
</script>

<Flex class="w-full h-full" gap="sm">
    <Flex class="w-[40%]" direction="column">
        <Flex direction="column" gap="xs">
            <!-- Location name, junction data (whether to use, ordered, junction) -->
            <TextInput label="Name" 
                placeholder="Basement"
                required={true} 
                error={locationData.name.length == 0} 
                bind:value={locationData.name} />
            <SelectImage bind:selectedImageID={locationData.image} />
            <Flex class="h-[36px]" align="center">
                <Switch label="Initially Accessible"
                    bind:checked={locationData.initial} />
            </Flex>
        </Flex>
        <Divider orientation="horizontal" /> 
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[60%]" align="center" justify="center">
        {#key imageDataFull}
            {#if imageDataFull !== undefined && imageDataFull[1].base64.length > 0}
                <img class="p-[1em] max-w-full max-h-full object-contain" src={imageDataFull[1].base64}>
            {:else}
                <Text class="text-center" size="lg">
                    {imageDataFull === undefined 
                        ? "Selected location doesn't have an image."
                        : "Selected location has missing image."}
                </Text>
            {/if}
        {/key}
    </Flex>
</Flex>