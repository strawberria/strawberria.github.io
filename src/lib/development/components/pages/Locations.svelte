<script lang="ts">
    import { Accordion, Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import AccordionHeader from "../AccordionHeader.svelte";
    import CurrentLocation from "../CurrentLocation.svelte";
    import { gameStore, currentLocationIDStore, bundleValidStore } from "../../functions/project";
    import type { GameLocation } from "../../global/functions/typings";
    import { validate } from "../../functions/validation";

    // Store current location for selection purposes
    let currentLocationIndex: number | undefined;
    let currentLocationData: GameLocation | undefined;
    currentLocationIDStore.subscribe(id => {
        const currentLocationIndexRaw = $gameStore.data.locations.findIndex(([_id, _]) => _id === id);
        currentLocationIndex = currentLocationIndexRaw !== -1
            ? currentLocationIndexRaw : undefined; // -1 for invalid
        currentLocationData = currentLocationIndex !== undefined
            ? $gameStore.data.locations[currentLocationIndex][1] : undefined;
    });

    // Handlers for individual game locations
    function createLocation(): [string, GameLocation] {
        const locationID = randomID("location");
        return [locationID, { name: "New Location", initial: false, image: "" }];
    }
    function locationOnChange(event: CustomEvent<string | string[] | null>) {
        $currentLocationIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game locations -->
        <AccordionHeader label="Locations"
            currentIDStore={currentLocationIDStore}
            orderedData={$gameStore.data.locations}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createLocation} />
        <Accordion class="overflow-auto h-full accordion-select"
            defaultValue={undefined}
            on:change={locationOnChange}>
            {#each $gameStore.data.locations as [locationID, locationData], index}
                <Accordion.Item class={$bundleValidStore["locations"]["locations"][index] 
                        ? "item-valid" : "item-error"}
                    value={locationID}>
                    <Flex slot="control" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {locationData.name}
                            {/key}
                        </Text>
                    </Flex>
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        {#if currentLocationIndex !== undefined && $currentLocationIDStore !== undefined
            && currentLocationData !== undefined}
            <CurrentLocation bind:locationIndex={currentLocationIndex}
                bind:locationID={$currentLocationIDStore}
                bind:locationData={currentLocationData}
                on:change={() => { validate(); }} />
        {/if}
    </Flex>
</Flex>