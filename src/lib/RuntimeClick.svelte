<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let key: string;
    export let name: string;
    export let seen: boolean;
    export let highlighted: boolean;

    const dispatch = createEventDispatcher();
    function handleClick() { 
        dispatch("dispatchClick", { key: key })
    }
    function handleEnter() { 
        dispatch("dispatchEnter", { key: key })
    }
</script>

<a class={`cursor-pointer h-6
    ${!seen ? "text-slate-200"
        : highlighted ? "text-slate-200" 
            : "text-slate-400 hover:text-slate-300 focus:text-slate-200"}
    ${seen ? "" : "shadow"}`}
    on:click={handleClick}
    on:mouseenter={handleEnter}>
    {name}
</a>

<style>
    .shadow {
        text-shadow: 0px 0px 5px #ff0061
    }
</style>