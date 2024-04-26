<script lang="ts">
    import { Tabs } from "@svelteuidev/core";
    import CurrentInteractionData from "$lib/development/components/CurrentInteractionData.svelte";
    import CurrentInteractionNodes from "$lib/development/components/CurrentInteractionNodes.svelte";
    import CurrentInteractionView from "$lib/development/components/CurrentInteractionView.svelte";
    import type { GameInteraction } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let interactionIndex: number | undefined;
    export let interactionID: string | undefined;
    export let interactionData: GameInteraction | undefined;
    // $: { interactionData; validate(); }
</script>

<Tabs class={`grow h-full tabs tabs-small ${interactionIndex === undefined 
    || interactionID === undefined || interactionData === undefined ? "hidden" : ""}`}>
    <Tabs.Tab label='Data'>
        {#if interactionIndex !== undefined && interactionID !== undefined
            && interactionData !== undefined}
            {#key interactionID}
                <CurrentInteractionData interactionIndex={interactionIndex}
                    interactionID={interactionID}
                    interactionData={interactionData}
                    on:change={() => { validate(); }} />
            {/key}
        {/if}
    </Tabs.Tab>
    <Tabs.Tab label='Nodes'>
        {#if interactionIndex !== undefined && interactionID !== undefined
            && interactionData !== undefined}
            {#key interactionID}
                <CurrentInteractionNodes interactionIndex={interactionIndex}
                    interactionID={interactionID}
                    interactionData={interactionData} 
                    on:change={() => { validate(); }} />
            {/key}
        {/if}
    </Tabs.Tab>
    <Tabs.Tab label='View'>
        {#if interactionIndex !== undefined && interactionID !== undefined
            && interactionData !== undefined}
            <CurrentInteractionView interactionData={interactionData} />
        {/if}
    </Tabs.Tab>
</Tabs>