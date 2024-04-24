<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Flex, NativeSelect, TextInput, Textarea } from "@svelteuidev/core";
    import { interactionNodeResultTypeSelectData, type GameInteractionNodeResult } from "../functions/typings";
    import SelectComponent from "./SelectComponent.svelte";
    import SelectLocation from "./SelectLocation.svelte";
    import SelectState from "./SelectState.svelte";

    const dispatch = createEventDispatcher();

    export let resultData: GameInteractionNodeResult;
    $: { resultData; dispatch("change") }

    // Reset results arguments whenever result type changed
    function onResultTypeChange() {
        resultData.args = ["", ""]; 
    }
</script>

<Flex direction="column" gap="xs">
    <!-- Result title, result type, whatever else -->
    <Flex direction="row" gap="md">
        <TextInput class="w-[60%]"
            label="Title" 
            placeholder="Add [Handcuffs] to [Arms]"
            required={true} 
            error={resultData.title.length == 0}
            bind:value={resultData.title} />
        <NativeSelect class="w-[40%]" 
            label="Type"
            data={interactionNodeResultTypeSelectData}
            on:change={() => { resultData = resultData }}
            bind:value={resultData.type}
            on:change={() => { onResultTypeChange() }} />
    </Flex>
    <!-- {:else if resultData.type === "locationAdd" || resultData.type === "locationRemove"} -->
    {#if resultData.type === "restraintAdd" || resultData.type === "restraintRemove"
        || resultData.type === "objectAdd" || resultData.type === "objectRemove"}
        {@const excludeRestraints = resultData.type[0] === "o"}
        {@const excludeObjects = !excludeRestraints}
        <SelectComponent class="w-[calc(50%-0.5em)]"
            label={excludeRestraints ? "Object" : "Restraint"}
            bind:selectedComponentID={resultData.args[0]}
            excludeBodyParts={true}
            excludeObjects={excludeObjects}
            excludeRestraints={excludeRestraints} />
    {:else if resultData.type === "stateSet"}
        <SelectState class="w-[calc(50%-0.5em)]"
            bind:selectedStateID={resultData.args[0]} />
    {:else if resultData.type === "flagSet"}
        <Flex direction="row" gap="md">
            <TextInput class="w-[50%]"
                label="Key"     
                placeholder="Mitted"
                required={true} 
                error={resultData.args[0].length == 0}
                bind:value={resultData.args[0]} />
            <TextInput class="w-[50%]"
                label="Value" 
                placeholder="false"
                required={true} 
                error={resultData.args[1].length == 0}
                bind:value={resultData.args[1]} />
        </Flex>
    {:else if resultData.type === "locationAdd" || resultData.type === "locationRemove"}
        <SelectLocation class="w-[calc(50%-0.5em)]"
            bind:selectedLocationID={resultData.args[0]} />
    {:else if resultData.type === "dialogShow"}
        <Textarea label="Text (Markdown)" 
            placeholder={"Gnawing at the tape mittens with your teeth, you're able to eventually unwrap the tape and free your fingers."}
            rows=4 required={true} error={resultData.args[0].length == 0} 
            bind:value={resultData.args[0]} />
    {/if}
</Flex>