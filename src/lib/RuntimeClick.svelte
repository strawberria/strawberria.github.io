<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let key: string;
    export let name: string;
    export let highlighted: boolean;

    const dispatch = createEventDispatcher();
    function handleClick() { 
        dispatch("dispatchClick", { key: key })
    }
</script>

<a class={`cursor-pointer
    ${highlighted ? "text-slate-200" : "text-slate-400 hover:text-slate-300 focus:text-slate-200"}`}
    on:click={handleClick}>
    {name}
</a>