<script lang="ts">
    import { onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import { graphviz, type Graphviz } from "d3-graphviz";
    import { Flex } from "@svelteuidev/core";
    import { generateInteractionGraphviz } from "$lib/development/functions/graphviz";
    import { type GameInteraction } from "$lib/global/functions/typings";

    export let renderStore: Writable<boolean>;
    export let interactionData: GameInteraction;
    let renderInst: Graphviz<any, any, any, any>;
    let graphData: string = "";
    function renderGraphData() {
        graphData = generateInteractionGraphviz(interactionData); 
        if(renderInst !== undefined) {
            renderInst.renderDot(graphData);
        }
    }
    renderStore.subscribe(value => {
        if(value === true) { 
            renderGraphData(); 
        }
    });

    onMount(async () => {
        const height = window.innerHeight * 1;
        const width = window.innerWidth * 1;
        renderInst = graphviz("#graphviz-interaction", { height, width });
        renderGraphData();
    });
</script>

<!-- Bind to this to clear before graphviz render -->
<Flex class="h-[calc(100vh-7.75em)] min-w-full" 
    justify="center" align="center" id="graphviz-interaction" />

<style>
    :global(#graphviz-interaction > svg) {
        height: 100%;
        width: 100%;
    }
</style>

