<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { getBodyPart } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedBodyPartID: string;
    export let label: string = "Body Part";
    export let exclude: string[] = [];

    let bodyPartSelectData: { label: string; value: string }[] = [];
    bundleValidStore.subscribe(_ => {
        bodyPartSelectData = [
            { label: "", value: "" },
            ...$gameStore.data.bodyParts
                .map(([bodyPartID, bodyPartData]) => ({
                    label: bodyPartData.display,
                    value: bodyPartID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={bodyPartSelectData}
    error={exclude.includes(selectedBodyPartID) === false
        && getBodyPart(selectedBodyPartID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedBodyPartID) }}
    bind:value={selectedBodyPartID} />
