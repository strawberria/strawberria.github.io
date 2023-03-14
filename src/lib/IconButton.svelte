<script lang="ts">
    export let label: string = "";
    export let disabled: boolean = false;
    // export let onclick: (this: Window, ev: MouseEvent) => any;
    export let onclick: any;
    let customClass: string = "";
    export { customClass as class };
</script>

<button class={`flex flex-row items-center justify-center
    text-slate-300 bg-slate-700 focus:bg-slate-500
    font-medium rounded text-sm text-center select-none
    px-2.5 py-2 space-x-1.5 
    ${!disabled ? "hover:bg-slate-600" : "cursor-not-allowed"}
    ${customClass}`}
    type="button"
    disabled={disabled}
    on:click={onclick}>
    <slot />
    {#if label !== ""}
        <span>{label}</span>
    {/if}
</button>