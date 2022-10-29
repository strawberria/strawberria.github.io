<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { timeSince } from "../utilities";
    import type { GameData } from "../types";

    export let previewData: GameData;
    export let supportedVersions: string[];
    const outdated = supportedVersions.includes(previewData.engine) === false

    const dispatch = createEventDispatcher();
    function handleClick() { 
        if(outdated) { return; }
        dispatch("dispatchClick", { key: previewData.filename })
    }
</script>

<div class={`flex flex-row justify-between space-x-1
    rounded border ${outdated ? 'text-slate-300 bg-slate-850 border-rose-900' 
        : 'text-slate-400 bg-slate-750 border-slate-700'}
    p-2 pl-4 pr-4`}>
    <a class="w-full cursor-pointer"
        on:click={handleClick}>
        <div class="flex flex-col w-full space-y-2">
            <div class="flex flex-row w-full items-end justify-between text-lg">
                <div class="flex flex-row items-end space-x-2">
                    <p class={`${outdated ? 'text-slate-500' : 'text-slate-400'}`}>
                        {#if outdated} 
                            <span class="text-rose-800 mr-2">❗ OUTDATED ❗</span>
                        {/if}
                        (Engine v{previewData.engine})
                    </p>
                    <p class={`${outdated ? 'text-slate-400' : 'text-slate-300'}`}>{previewData.title} - {previewData.author}</p>
                </div>
                <p class={`text-bold ${outdated ? 'text-slate-400' : 'text-slate-300'}`}>v{previewData.version} - Updated {timeSince(new Date(previewData.updated * 1000))}</p>
            </div>
            <p class={`whitespace-pre-line ${outdated ? 'text-slate-500' : 'text-slate-400'}`}>{previewData.synopsis}</p>
        </div>
    </a>
</div>
