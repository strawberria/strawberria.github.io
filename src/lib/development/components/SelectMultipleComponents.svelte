<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Accordion, Flex, Text } from "@svelteuidev/core";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import TextLabel from "$lib/development/components/TextLabel.svelte";

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
    gameStore.subscribe(gameData => {
        componentSelectData = [
            // { label: "", value: "" },
            ...(excludeBodyParts ? [] : gameData.data.bodyParts
                .map(([bodyPartID, bodyPartData]) => ({
                        label: `${oneType ? "" : "(B) "}${bodyPartData.name}`,
                        value: bodyPartID,
                    }))),
            // ...(excludeObjects ? [] : gameData.data.objects
            //     .map(([objectID, objectData]) => ({
            //             label: objectData.name,
            //             value: objectID,
            //         }))),
            // ...(excludeRestraints ? [] : gameData.data.restraints
            //     .map(([restraintID, restraintData]) => ({
            //             label: restraintData.name,
            //             value: restraintID,
            //         }))),
        ]
    });

    // Should only have string[] since multiple
    function componentsOnChange(event: CustomEvent<string | string[] | null>) {
        selectedComponentIDs = event.detail as string[];
        dispatch("change", selectedComponentIDs);
    }
</script>

<Flex class={_class} direction="column">
    <TextLabel class="mb-[0.25em]">{label}</TextLabel>
    <Accordion class="overflow-auto h-full accordion-select"
        defaultValue={undefined}
        multiple={true}
        on:change={componentsOnChange}>
        {#each componentSelectData as componentData, index}
            <Accordion.Item value={componentData.value}>
                <Flex slot="control" 
                    direction="row" 
                    justify="space-between">
                    <Text class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {componentData.label}
                        {/key}
                    </Text>
                </Flex>
            </Accordion.Item>
        {/each}
    </Accordion>
</Flex>