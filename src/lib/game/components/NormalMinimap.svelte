<script lang="ts">
    import { Flex, NativeSelect } from "@svelteuidev/core";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";
    import type { GameData, GameImage, GameLocation } from "$lib/global/functions/typings";

    export let gameData: GameData;

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
        console.log(locationSelectData)
        locationSelectData.sort((a, b) => a.label.localeCompare(b.label));
    }
    progressStore.subscribe(_ => { updateData() });
</script>

<Flex class="relative grow w-full">
    <Flex class="absolute inset-0" align="center" justify="center">
        <img class="max-w-full max-h-full object-contain"
            usemap="#minimap"
            src={locationImageData.base64} />
        <map name="minimap">
            <area shape="rect" coords="0,0,500,500"
                on:click={() => alert("click")} />
        </map>
    </Flex>
</Flex>
<NativeSelect label="Select Location"
    data={locationSelectData}
    bind:value={$progressStore.location} />