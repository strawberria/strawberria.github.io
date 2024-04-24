<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import type { GameInteraction } from "$lib/global/functions/typings";
    import { getInteractionNode } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let interactionData: GameInteraction;
    export let selectedNodeID: string;
    export let label: string = "State";
    export let exclude: string[] = [];

    let nodeSelectData: { label: string; value: string }[] = [];
    function updateNodeSelectData() {
        nodeSelectData = [
            { label: "", value: "" },
            ...interactionData.nodes
                .map(([nodeID, nodeData]) => ({
                    label: nodeData.title,
                    value: nodeID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    }
    gameStore.subscribe(_ => { updateNodeSelectData(); });
    $: { interactionData; updateNodeSelectData(); }
</script>

<NativeSelect class={_class}
    label={label}
    data={nodeSelectData}
    error={exclude.includes(selectedNodeID) === false
        && getInteractionNode(selectedNodeID, interactionData) === undefined}
    on:change={() => { dispatch("change", selectedNodeID) }}
    bind:value={selectedNodeID} />
