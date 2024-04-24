<script lang="ts">
    import { onMount } from "svelte";
    import { graphviz, type Graphviz } from "d3-graphviz";
    import { Flex } from "@svelteuidev/core";
    import { generateStatesGraphviz } from "../functions/graphviz";
    import { bundleValidStore } from "../functions/project";

    let renderInst: Graphviz<any, any, any, any>;
    let graphData: string = "";
    function renderGraphData() {
        graphData = generateStatesGraphviz(); 
        if(renderInst !== undefined) {
            renderInst.renderDot(graphData);
        }
    }
    bundleValidStore.subscribe(_ => { renderGraphData(); })

    onMount(async () => {
        const height = window.innerHeight * 1;
        const width = window.innerWidth * 1;
        renderInst = graphviz("#graphviz-states", { height, width });
        renderGraphData();
    });
</script>

<!-- Bind to this to clear before graphviz render -->
<Flex class="h-[calc(100vh-7.75em)] min-w-full" 
    justify="center" align="center" id="graphviz-states" />

<style>
    :global(#graphviz-states > svg) {
        height: 100%;
        width: 100%;
    }
</style>

