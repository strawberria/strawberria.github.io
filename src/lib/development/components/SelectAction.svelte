<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { gameStore } from "../functions/project";
    import { getAction } from "../functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedActionID: string;
    export let label: string = "Action";
    export let exclude: string[] = [];

    let actionSelectData: { label: string; value: string }[] = [];
    gameStore.subscribe(gameData => {
        actionSelectData = [
            { label: "", value: "" },
            ...gameData.data.actions
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
    error={exclude.includes(selectedActionID) === false
        && getAction(selectedActionID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedActionID) }}
    bind:value={selectedActionID} />
