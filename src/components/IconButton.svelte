<script lang="ts">
    export let label: string = "";
    export let onclick: (this: Window, ev: MouseEvent) => any;
    let customClass: string = "";
    export { customClass as class };
</script>

<button class={`flex flex-row items-center justify-center
    text-slate-300 bg-slate-700 hover:bg-slate-600 focus:bg-slate-500
    font-medium rounded-md text-sm text-center 
    px-2.5 py-2 space-x-1.5 
    ${customClass}`}
    type="button"
    on:click={onclick}>
    <slot />
    {#if label !== ""}
        <span>{label}</span>
    {/if}
</button>