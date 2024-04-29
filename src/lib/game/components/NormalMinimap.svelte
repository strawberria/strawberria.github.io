<script lang="ts">
    import { Flex, NativeSelect } from "@svelteuidev/core";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";
    import type { GameData, GameImage, GameLocation } from "$lib/global/functions/typings";
    import { get } from "svelte/store";
    import ClickableImage from "$lib/game/components/ClickableImage.svelte";

    // Update available and current locations data whenever lookup changes
    let currentLocationData: GameLocation;
    let locationImageData: GameImage;
    let locationSelectData: { label: string, value: string }[];
    function updateData() {
        currentLocationData = $lookupStore.locations[$progressStore.location];
        locationImageData = $lookupStore.images[currentLocationData.image];
        locationSelectData = Object.entries($lookupStore.locations)
            .filter(([locationID, _]) => $progressStore.locations.includes(locationID))
            .map(([locationID, locationData]) => ({ label: locationData.display, value: locationID }));
        locationSelectData.sort((a, b) => a.label.localeCompare(b.label));
    }
    progressStore.subscribe(_ => { updateData() });
</script>

<ClickableImage class="grow w-full" 
    imageData={locationImageData} />
<NativeSelect label="Select Location"
    data={locationSelectData}
    bind:value={$progressStore.location} />