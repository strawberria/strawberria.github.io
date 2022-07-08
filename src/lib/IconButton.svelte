<script lang="ts">
    export let label: string = "";
    export let disabled: boolean = false;
    export let onclick: (this: Window, ev: MouseEvent) => any;
    let customClass: string = "";
    export { customClass as class };
</script>

<button class={`flex flex-row items-center justify-center
    font-medium rounded-md text-sm text-center 
    px-2.5 py-2 space-x-1.5 
    ${disabled 
        ? "cursor-not-allowed text-slate-400 bg-slate-750" 
        : "text-slate-300 bg-slate-700 hover:bg-slate-600 focus:bg-slate-500"}
    ${customClass}`}
    type="button"
    disabled={disabled}
    on:click={onclick}>
    <slot />
    {#if label !== ""}
        <span>{label}</span>
    {/if}
</button>