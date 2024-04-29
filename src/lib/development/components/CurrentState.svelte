<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Flex, Tabs, Text } from "@svelteuidev/core";
    import CurrentStateData from "$lib/development/components/CurrentStateData.svelte";
    import CurrentStateView from "$lib/development/components/StatesView.svelte";
    import type { GameState } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let stateIndex: number | undefined;
    export let stateID: string | undefined;
    export let stateData: GameState | undefined;
    // $: { stateData; validate(); }

    // Render view when tab is clicked
    let renderStore: Writable<boolean> = writable(false);
    function change(event: any) { 
        $renderStore = event.detail.index === 1;
    }
</script>

<Tabs class="grow h-full tabs tabs-small"
    on:change={change}>
    <Tabs.Tab label='Data'>
        {#if stateIndex !== undefined && stateID !== undefined
            && stateData !== undefined}
            <CurrentStateData stateIndex={stateIndex}
                stateID={stateID}
                stateData={stateData}
                on:change={() => { validate(); }} />
        {:else}
            <Flex class="h-[calc(100vh-7.75em)] w-full" align="center" justify="center">
                <Text size="xl">Select a state first!</Text>
            </Flex>
        {/if}
    </Tabs.Tab>
    <Tabs.Tab label='View'>
        <CurrentStateView renderStore={renderStore}/>
    </Tabs.Tab>
</Tabs>