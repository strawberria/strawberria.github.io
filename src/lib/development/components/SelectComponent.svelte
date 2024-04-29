<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { NativeSelect } from "@svelteuidev/core";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { getBodyPart, getObject, getRestraint } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedComponentID: string;
    export let label: string = "Component";
    export let noError: boolean = false;
    export let error: boolean = false;
    export let excludeBodyParts: boolean = false;
    export let excludeObjects: boolean = false;
    export let excludeRestraints: boolean = false;
    export let excludeStore: Writable<string[]> = writable([]);
    let oneType = [excludeBodyParts, excludeObjects, excludeRestraints]
        .filter(val => val === false).length === 1;

    let componentSelectData: { label: string; value: string }[] = [];
    function updateSelectData() {
        componentSelectData = [
            { label: "", value: "" },
            ...(excludeBodyParts ? [] : $gameStore.data.bodyParts
                .map(([bodyPartID, bodyPartData]) => ({
                        label: `${oneType ? "" : "(B) "}${bodyPartData.name}`,
                        value: bodyPartID,
                    }))),
            ...(excludeObjects ? [] : $gameStore.data.objects
                .map(([objectID, objectData]) => ({
                        label: `${oneType ? "" : "(O) "}${objectData.name}`,
                        value: objectID,
                    }))),
            ...(excludeRestraints ? [] : $gameStore.data.restraints
                .map(([restraintID, restraintData]) => ({
                        label: `${oneType ? "" : "(R) "}${restraintData.name}`,
                        value: restraintID,
                    }))),
        ].filter(data => $excludeStore.includes(data.value) === false);
    }
    bundleValidStore.subscribe(_ => { updateSelectData() });
    excludeStore.subscribe(_ => { updateSelectData() });
</script>

<NativeSelect class={_class}
    label={label}
    data={componentSelectData}
    error={!noError && (error || (getBodyPart(selectedComponentID, $gameStore) === undefined
        && getObject(selectedComponentID, $gameStore) === undefined
        && getRestraint(selectedComponentID, $gameStore) === undefined))}
    on:change={() => { dispatch("change", selectedComponentID) }}
    bind:value={selectedComponentID} />
