<script lang="ts">
    import type { ProjectStateData } from "../miscellaneous";
    import { createEventDispatcher } from "svelte";

    export let key: string;
    export let stateData: ProjectStateData;
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
    <div class="grow flex flex-row items-center space-x-3 basis-0 shrink min-w-0">
        <p class="font-mono font-bold text-l w-4">
            {stateData.type === "starting"
                ? "S" : stateData.type === "goodEnd" 
                    ? "G" : stateData.type === "badEnd"
                        ? "B" : ""}
        </p>
        <p class="text-left w-11/12 min-w-0 truncate">{stateData.title}</p>
    </div>
    <p class={`font-mono ${selected === true
        ? "text-slate-500"
        : "text-slate-600"}`}>
        {key}
    </p>
</div>