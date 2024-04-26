<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Flex, Text } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import TextLabel from "$lib/development/components/TextLabel.svelte";
    import { writable, type Writable } from "svelte/store";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedComponentIDs: string[];
    export let label: string = "Component";
    // export let error: boolean = false;
    export let excludeBodyParts: boolean = false;
    export let excludeObjects: boolean = false;
    export let excludeRestraints: boolean = false;
    let oneType = [excludeBodyParts, excludeObjects, excludeRestraints]
        .filter(val => val === true).length === 1;

    let componentSelectData: { label: string; value: string }[] = [];
    bundleValidStore.subscribe(_ => {
        componentSelectData = [
            // { label: "", value: "" },
            { label: "[ Anything ]", value: "{anything}"},
            ...(excludeBodyParts ? [] : $gameStore.data.bodyParts
                .map(([bodyPartID, bodyPartData]) => ({
                        label: `${oneType ? "" : "(B) "}${bodyPartData.name}`,
                        value: bodyPartID,
                    }))),
            ...(excludeObjects ? [] : $gameStore.data.objects
                .map(([objectID, objectData]) => ({
                        label: objectData.name,
                        value: objectID,
                    }))),
            ...(excludeRestraints ? [] : $gameStore.data.restraints
                .map(([restraintID, restraintData]) => ({
                        label: restraintData.name,
                        value: restraintID,
                    }))),
        ]
    });

    export let accordionItemsOpenStore: Writable<boolean[]> = writable(componentSelectData
        .map(data => selectedComponentIDs.includes(data.value)));
    accordionItemsOpenStore.subscribe(accordionItemsOpen => {
        selectedComponentIDs = componentSelectData
        .filter((data, index) => accordionItemsOpen[index] === true)
        .map((data) => data.value);
    })
</script>

<Flex class={_class} direction="column">
    <TextLabel class="mb-[0.25em]">{label}</TextLabel>
    <Accordion class="accordion accordion-select grow"
        multiple={true}>
        {#each componentSelectData as componentData, index}
            <AccordionItem transitionType="slide" transitionParams={{ duration: 200 }}
                bind:open={$accordionItemsOpenStore[index]}>
                <Flex slot="header" 
                    direction="row" 
                    justify="space-between">
                    <Text class={`min-h-[1.5em] w-full 
                        ${componentData.value === "{anything}" ? "text-center" : ""}`} size="md">
                        {#key $bundleValidStore}
                            {componentData.label}
                        {/key}
                    </Text>
                </Flex>
            </AccordionItem>
        {/each}
    </Accordion>
</Flex>