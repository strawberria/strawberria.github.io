<script lang="ts">
    export let label: string;
    export let placeholder: string = "";
    export let value: string;
    export let rows: number;
    let customClass: string = "";
    export { customClass as class };
</script>

<div class={`flex flex-col items-start space-y-0.5
    ${customClass}`}>
    <p class="pl-1 
        text-slate-400 text-sm">
        {label}
    </p>
    <textarea class="grow
        rounded bg-slate-800 border border-slate-500 placeholder-slate-500 focus:outline-none focus:border-slate-400
        text-l text-slate-300
        w-full p-2 resize-none overflow-clip" 
        type="text" 
        rows={rows}
        placeholder={placeholder} 
        bind:value={value} />
</div>