<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Flex, NativeSelect, TextInput } from "@svelteuidev/core";
    import SelectComponent from "$lib/development/components/SelectComponent.svelte";
    import SelectState from "$lib/development/components/SelectState.svelte";
    import { interactionNodeCriteriaTypeSelectData, type GameInteractionNodeCriteria } from "$lib/global/functions/typings";

    const dispatch = createEventDispatcher();

    export let criteriaData: GameInteractionNodeCriteria;
    $: { criteriaData; dispatch("change") }

    // Reset criteria arguments whenever criteria type changed
    function onCriteriaTypeChange() {
        criteriaData.args = ["", ""]; 
    }
</script>

<Flex direction="column" gap="xs">
    <!-- Criteria title, criteria type, whatever else -->
    <Flex direction="row" gap="md">
        <!-- <TextInput class="w-[60%]"
            label="Title" 
            placeholder="Add [Handcuffs] to [Arms]"
            required={true} 
            error={criteriaData.title.length == 0}
            bind:value={criteriaData.title} /> -->
        <NativeSelect class="w-[40%]" 
            label="Type"
            data={interactionNodeCriteriaTypeSelectData}
            on:change={() => { criteriaData = criteriaData }}
            bind:value={criteriaData.type}
            on:change={() => { onCriteriaTypeChange() }} />
    </Flex>
    {#if criteriaData.type === "flagEquals" || criteriaData.type === "flagNotEquals"}
        <Flex direction="row" gap="md">
            <TextInput class="w-[50%]"
                label="Key"     
                placeholder="Mitted"
                required={true} 
                error={criteriaData.args[0].length == 0}
                bind:value={criteriaData.args[0]} />
            <TextInput class="w-[50%]"
                label="Value" 
                placeholder="false"
                required={true} 
                error={criteriaData.args[1].length == 0}
                bind:value={criteriaData.args[1]} />
        </Flex>
    {:else if criteriaData.type === "currentState"}
        <SelectState class="w-[calc(50%-0.5em)]"
            label="Current State"
            bind:selectedStateID={criteriaData.args[0]} />
    {:else if criteriaData.type === "restraintWearing" || criteriaData.type === "restraintNotWearing"
        || criteriaData.type === "objectFound" || criteriaData.type === "objectNotFound"}
        {@const excludeRestraints = criteriaData.type[0] === "o"}
        {@const excludeObjects = !excludeRestraints}
        {#key criteriaData.type}
            <SelectComponent class="w-[calc(50%-0.5em)]"
                label={excludeRestraints ? "Object" : "Restraint"}
                bind:selectedComponentID={criteriaData.args[0]}
                excludeBodyParts={true}
                excludeObjects={excludeObjects}
                excludeRestraints={excludeRestraints} />
        {/key}
    {:else if criteriaData.type === "restraintWearingTag" || criteriaData.type === "restraintNotWearingTag"
        || criteriaData.type === "objectFoundTag" || criteriaData.type === "objectNotFoundTag"
        || criteriaData.type === "component1Tag" || criteriaData.type === "component2Tag"}
        <TextInput class="w-[calc(50%-0.5em)]"
            label="Tag"     
            placeholder="locked-combination"
            required={true} 
            error={criteriaData.args[0].length == 0}
            bind:value={criteriaData.args[0]} />
    {/if}
</Flex>