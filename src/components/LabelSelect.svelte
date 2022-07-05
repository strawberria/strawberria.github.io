<script lang="ts">
    import type { ChoiceData } from "../miscellaneous";

    export let label: string;
    export let choicesData: ChoiceData<any>[];
    // Does this work properly?
    export let selected: string = undefined;
    export let disabled: boolean = false;
    let customClass: string = "";
    export { customClass as class };
</script>

<div class={`flex flex-col items-start space-y-0.5
    ${customClass}`}>
    <p class="pl-1 
        text-slate-400 text-sm">
        {label}
    </p>
    <select class={`rounded  border border-slate-500 placeholder-slate-500 focus:outline-none focus:border-slate-400
            text-slate-300  
            block w-full p-2.5
            ${disabled === true
                ? "bg-slate-700"
                : "bg-slate-800"}`}
        disabled={disabled}
        bind:value={selected}>
        {#each choicesData as choiceData}
            <option class={`bg-slate-750 ${choiceData.enabled === true
                    ? "text-slate-300"
                    : "text-slate-500"}`}
                value={choiceData.key}
                disabled={choiceData.enabled === false}>
                {choiceData.display}
            </option>
        {/each}
    </select>
</div>