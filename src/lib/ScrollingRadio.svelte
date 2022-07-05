<script lang="ts">
    import type { ScrollingRadioData } from "../types";
    import { createEventDispatcher } from "svelte";

    // Every component should have prop "selected" as boolean
    export let selectedID: string | undefined;
    export let deselectable: boolean;
    export let scrollingRadioData: ScrollingRadioData[];
    const dispatch = createEventDispatcher();

    function handleClick(event: any) {
        selectedID = deselectable === true && event.detail.key === selectedID
            ? undefined
            : event.detail.key;
        dispatch("dispatchClick", { id: selectedID });
    }
</script>

{#each scrollingRadioData as data}
    <svelte:component this={data.component}
        {...data.props}
        class={"cursor-pointer select-none"}
        key={data.key}
        selected={selectedID === data.key}
        on:dispatchClick={handleClick} />
{/each}