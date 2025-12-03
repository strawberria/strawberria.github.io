<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { getAction } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedActionID: string;
    export let label: string = "Action";
    export let exclude: string[] = [];

    let actionSelectData: { label: string; value: string }[] = [];
    bundleValidStore.subscribe(_ => {
        actionSelectData = [
            { label: "", value: "" },
            { label: "Examine", value: "examine" },
            ...$gameStore.data.actions
                .map(([actionID, actionData]) => ({
                    label: actionData.name,
                    value: actionID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={actionSelectData}
    error={selectedActionID != "" && exclude.includes(selectedActionID) === false
        && getAction(selectedActionID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedActionID) }}
    bind:value={selectedActionID} />
