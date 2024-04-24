<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { getImage } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedImageID: string;
    export let label: string = "Image";
    export let exclude: string[] = [];

    let imageSelectData: { label: string; value: string }[] = [];
    bundleValidStore.subscribe(_ => {
        imageSelectData = [
            { label: "", value: "" },
            ...$gameStore.data.images
                .map(([imageID, imageData]) => ({
                    label: imageData.title,
                    value: imageID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={imageSelectData}
    error={exclude.includes(selectedImageID) === false
        && getImage(selectedImageID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedImageID) }}
    bind:value={selectedImageID} />
