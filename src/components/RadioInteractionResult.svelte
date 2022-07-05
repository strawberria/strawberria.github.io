<script lang="ts">
    import type { ProjectInteractionResultData } from "../miscellaneous";
    import { createEventDispatcher } from "svelte";

    export let key: string;
    export let resultData: ProjectInteractionResultData;
    export let selected: boolean;
    let customClass: string;
    export { customClass as class };

    const dispatch = createEventDispatcher();
    function handleClick() { 
        dispatch("dispatchClick", { key: key })
    }
</script>

<div class={`flex flex-row justify-between space-x-1
    rounded border 
    p-2 pl-4 pr-4
    ${customClass} ${selected === true
        ? "text-slate-200 bg-slate-700 border-slate-600"
        : "text-slate-400 bg-slate-750 border-slate-700"}`}
    on:click={handleClick}>
    <p class="text-left w-11/12 min-w-0 truncate">{resultData.devName}</p>
    <div class="flex flex-row items-center h-full">
        <p class={`text-center font-mono ${selected === true
            ? "text-slate-500"
            : "text-slate-600"}`}>
            {key}
        </p>
    </div>
</div>