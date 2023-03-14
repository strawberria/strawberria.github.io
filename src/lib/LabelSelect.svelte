<script lang="ts">
    import type { SelectChoiceData } from "../typings";

    export let label: string = "";
    export let value: any;
    export let disabled: boolean = false;
    export let choicesData: SelectChoiceData[];
    export let valid: boolean = true;
    let customClass: string = "";
    export { customClass as class };
</script>

<div class={`flex flex-col items-start space-y-0.5
    ${customClass}`}>
    {#if label !== ""}
        <p class="pl-1 
            text-slate-400 text-sm select-none">
            {label}
        </p>
    {/if}
    <select class={`rounded border placeholder-slate-500 focus:outline-none
        text-slate-300 bg-inherit
        block w-full pl-2 pr-2 pt-1 pb-1
        ${!valid ? "border-red-800 focus-within:border-red-600" 
            : "border-slate-500 focus-within:border-slate-400"}
        ${disabled ? "cursor-not-allowed" : ""}`}
        bind:value={value}
        disabled={disabled}>
        {#each choicesData as choiceData}
            <option class={`bg-slate-775 ${choiceData.enabled === true
                    ? "text-slate-300"
                    : "text-slate-500"}`}
                value={choiceData.key}
                disabled={choiceData.enabled === false}>
                {choiceData.display}
            </option>
        {/each}
    </select>
</div>