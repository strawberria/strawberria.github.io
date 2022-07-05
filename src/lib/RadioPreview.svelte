<script lang="ts">
    import { timeSince } from "../utilities";
    import type { PreviewGameData } from "../types";

    export let previewData: PreviewGameData;
    let differenceStr: string = "";
    $: {
        previewData;
        differenceStr = previewData.updated !== undefined
            ? timeSince(new Date(previewData.updated))
            : "???";
    }
</script>

<div class="flex flex-row justify-between space-x-1
    rounded border text-slate-400 bg-slate-750 border-slate-700
    p-2 pl-4 pr-4">
    <a class="w-full"
        href={`games/${previewData.ref}`}>
        <div class="flex flex-col w-full space-y-2">
            <div class="flex flex-row w-full items-end justify-between">
                <div class="flex flex-row items-end space-x-2">
                    <p class="text-lg text-slate-400">(v{previewData.information.version})</p>
                    <p class="text-lg text-slate-300">{previewData.information.title} - {previewData.information.author}</p>
                </div>
                <p class="text-bold text-slate-400">Updated {differenceStr}</p>
            </div>
            <p class="text-slate-400">{previewData.information.synopsis}</p>
        </div>
    </a>
</div>
