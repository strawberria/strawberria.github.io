<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NativeSelect } from "@svelteuidev/core";
    import { gameStore } from "$lib/development/functions/project";
    import { getState } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    let _class: string = ""; export { _class as class };
    export let selectedStateID: string;
    export let label: string = "State";
    export let exclude: string[] = [];

    let stateSelectData: { label: string; value: string }[] = [];
    gameStore.subscribe(gameData => {
        stateSelectData = [
            { label: "", value: "" },
            ...gameData.data.states
                .map(([stateID, stateData]) => ({
                    label: stateData.title,
                    value: stateID,
                }))
                .filter(data => exclude.includes(data.value) === false),
        ];
    });
</script>

<NativeSelect class={_class}
    label={label}
    data={stateSelectData}
    error={exclude.includes(selectedStateID) === false
        && getState(selectedStateID, $gameStore) === undefined}
    on:change={() => { dispatch("change", selectedStateID) }}
    bind:value={selectedStateID} />
