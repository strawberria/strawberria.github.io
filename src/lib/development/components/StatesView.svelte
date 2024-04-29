<script lang="ts">
    import { type Writable } from "svelte/store";
    import { graphviz, type Graphviz } from "d3-graphviz";
    import { Flex } from "@svelteuidev/core";
    import { generateStatesGraphviz } from "$lib/development/functions/graphviz";
    import { onMount } from "svelte";

    export let renderStore: Writable<boolean>;
    let renderInst: Graphviz<any, any, any, any>;
    let graphData: string = "";
    function renderGraphData() {
        graphData = generateStatesGraphviz(); 
        if(renderInst !== undefined) {
            renderInst.renderDot(graphData);
        }
    }
    renderStore.subscribe(value => {
        if(value === true) { 
            renderGraphData(); 
        }
    });

    // Whenever tab clicked, then render
    onMount(() => {
        const height = window.innerHeight * 1;
        const width = window.innerWidth * 1;
        renderInst = graphviz("#graphviz-states", { height, width });
        renderGraphData();
    })
</script>

<!-- Bind to this to clear before graphviz render -->
<Flex class={`h-[calc(100vh-7.75em)] min-w-full`} 
    justify="center" align="center" id="graphviz-states" />

<style>
    :global(#graphviz-states > svg) {
        height: 100%;
        width: 100%;
    }
</style>

