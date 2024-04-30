<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Flex, TextInput } from "@svelteuidev/core";
    import SelectInteractionNode from "$lib/development/components/SelectInteractionNode.svelte";
    import { type GameInteraction, type GameInteractionNodeFlagMap } from "$lib/global/functions/typings";

    const dispatch = createEventDispatcher();

    export let interactionData: GameInteraction;
    export let interactionNodeID: string;
    export let flagMapData: GameInteractionNodeFlagMap;
    $: { flagMapData; dispatch("change") }
</script>

<Flex direction="row" gap="md">
    <TextInput class="w-[50%]"
        label="Value"     
        placeholder="button_1"
        required={true} 
        error={flagMapData.value.length == 0}
        bind:value={flagMapData.value} />
    <SelectInteractionNode class="w-[calc(50%-0.5em)]"
        label="Node"
        bind:interactionData={interactionData}
        bind:selectedNodeID={flagMapData.node}
        exclude={[interactionNodeID]} />
</Flex>