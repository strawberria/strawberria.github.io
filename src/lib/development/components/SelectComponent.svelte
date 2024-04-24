<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
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
    let oneType = [excludeBodyParts, excludeObjects, excludeRestraints]
        .filter(val => val === true).length === 1;

    let componentSelectData: { label: string; value: string }[] = [];
    gameStore.subscribe(gameData => {
        componentSelectData = [
            { label: "", value: "" },
            ...(excludeBodyParts ? [] : gameData.data.bodyParts
                .map(([bodyPartID, bodyPartData]) => ({
                        label: `${oneType ? "" : "(B) "}${bodyPartData.name}`,
                        value: bodyPartID,
                    }))),
            ...(excludeObjects ? [] : gameData.data.objects
                .map(([objectID, objectData]) => ({
                        label: objectData.name,
                        value: objectID,
                    }))),
            ...(excludeRestraints ? [] : gameData.data.restraints
                .map(([restraintID, restraintData]) => ({
                        label: restraintData.name,
                        value: restraintID,
                    }))),
        ]
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={componentSelectData}
    error={!noError && (error || (getBodyPart(selectedComponentID, $gameStore) === undefined
        && getObject(selectedComponentID, $gameStore) === undefined
        && getRestraint(selectedComponentID, $gameStore) === undefined))}
    on:change={() => { dispatch("change", selectedComponentID) }}
    bind:value={selectedComponentID} />
