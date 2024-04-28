<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import CurrentLocation from "$lib/development/components/CurrentLocation.svelte";
    import { gameStore, currentLocationIDStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameLocation } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    // Store current location for selection purposes
    let currentLocationIndex: number | undefined;
    let currentLocationData: GameLocation | undefined;
    let locationAccordionOpenStore: Writable<boolean[]> = writable([]);
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
        return [locationID, { name: "New Location", initial: false, image: "", display: "" }];
    }
</script>

<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[calc(30%-0.75em)]" direction="column" gap="xs">
        <!-- Game locations -->
        <AccordionHeader label="Locations"
            accordionOpenStore={locationAccordionOpenStore}
            currentIDStore={currentLocationIDStore}
            orderedData={$gameStore.data.locations}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createLocation} />
        <Accordion class="accordion accordion-select grow">
            {#each $gameStore.data.locations as [locationID, locationData], index}
                <AccordionItem class={$bundleValidStore["locations"]["locations"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$locationAccordionOpenStore[index]}>
                    <Flex slot="header" 
                        direction="row" 
                        justify="space-between">
                        <Text class="min-h-[1.5em]" size="md">
                            {#key $bundleValidStore}
                                {locationData.name}
                            {/key}
                        </Text>
                    </Flex>
                </AccordionItem>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[70%]" direction="column" gap="xs">
        {#key $currentLocationIDStore}
            {#if currentLocationIndex !== undefined && $currentLocationIDStore !== undefined
                && currentLocationData !== undefined}
                <CurrentLocation bind:locationIndex={currentLocationIndex}
                    bind:locationID={$currentLocationIDStore}
                    bind:locationData={currentLocationData}
                    on:change={() => { validate(); }} />
            {/if}
        {/key}
    </Flex>
</Flex>