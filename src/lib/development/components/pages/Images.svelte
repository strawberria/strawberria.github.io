<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentImage from "$lib/development/components/CurrentImage.svelte";
    import ErrorMessage from "$lib/development/components/ErrorMessage.svelte";
    import { gameStore, currentImageIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameImage } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    // Store current image for selection purposes
    let currentImageIndex: number | undefined;
    let currentImageData: GameImage | undefined;
    let imageAccordionOpenStore: Writable<boolean[]> = writable([]);
    currentImageIDStore.subscribe(id => {
        const currentImageIndexRaw = $gameStore.data.images.findIndex(([_id, _]) => _id === id);
        currentImageIndex = currentImageIndexRaw !== -1
            ? currentImageIndexRaw : undefined; // -1 for invalid
        currentImageData = currentImageIndex !== undefined
            ? $gameStore.data.images[currentImageIndex][1] : undefined;
    });

    // Handlers for individual game images
    function createImage(): [string, GameImage] {
        const imageID = randomID("image");
        return [imageID, { title: "New Image", base64: "", areas: [] }];
    }

    // Convert number of bytes to KB and MB
    // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    const bytesWarning = 1024 * 1024; // 1MB
    function formatBytes(bytes: number, decimals: number) {
        if (bytes === 0) return '0 Bytes'

        const kilo = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(kilo))

        return `${parseFloat((bytes / Math.pow(kilo, i)).toFixed(decimals))} ${sizes[i]}`
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game images -->
        <AccordionHeader label="Images"
            accordionOpenStore={imageAccordionOpenStore}
            currentIDStore={currentImageIDStore}
            orderedData={$gameStore.data.images}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createImage} />
        <Accordion class="accordion accordion-select grow">
            {#each $gameStore.data.images as [imageID, imageData], index}
                <AccordionItem class={$bundleValidStore["images"]["images"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$imageAccordionOpenStore[index]}>
                    <Flex slot="header" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {imageData.title}
                            {/key}
                        </Text>
                        <div class="grow" />
                        {#key $bundleValidStore}
                            {#if imageData.base64.length !== 0}
                                {@const bytesText = formatBytes(imageData.base64.length, 2)}
                                <Text class="min-h-[1.5em]" size="md">
                                    {#if imageData.base64.length > bytesWarning}
                                        ❗
                                    {/if}
                                    {bytesText}
                                </Text>
                            {/if}
                        {/key}
                    </Flex>
                </AccordionItem>
            {/each}
        </Accordion>
        <ErrorMessage show={$bundleValidStore["images"]["hasLargeImage"] === 2}
            text="Images should ideally be smaller than 1MB!" />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        {#key $currentImageIDStore}
            {#if currentImageIndex !== undefined && $currentImageIDStore !== undefined
                && currentImageData !== undefined}
                <CurrentImage bind:imageIndex={currentImageIndex}
                    bind:imageID={$currentImageIDStore}
                    bind:imageData={currentImageData}
                    on:change={() => { validate() }} />
            {/if}
        {/key}
    </Flex>
</Flex>