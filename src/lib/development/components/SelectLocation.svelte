<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { getLocation } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedLocationID: string;
    export let label: string = "Location";
    export let exclude: string[] = [];

    let locationSelectData: { label: string; value: string }[] = [];
    gameStore.subscribe(gameData => {
        locationSelectData = [
            { label: "", value: "" },
            ...gameData.data.locations
                .map(([locationID, locationData]) => ({
                    label: locationData.name,
                    value: locationID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={locationSelectData}
    error={exclude.includes(selectedLocationID) === false
        && getLocation(selectedLocationID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedLocationID) }}
    bind:value={selectedLocationID} />
