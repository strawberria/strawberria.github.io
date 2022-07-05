<script lang="ts">
    export let label: string;
    export let value: boolean;
    let customClass: string = "";
    export { customClass as class };
</script>

<div class={`flex flex-col items-start space-y-0.5
    pb-2
    ${customClass}`}>
    <p class="pl-1 mb-2 
        text-slate-400 text-sm">
        {label}
    </p>
    <label class="inline-flex relative items-center 
        cursor-pointer 
        ml-0.5">
        <input type="checkbox" class="sr-only peer"
            bind:checked={value}>
        <div class="bg-slate-700 
            rounded-full border border-slate-700 
            after:rounded-full after:bg-slate-400 after:border after:border-slate-400 after:h-5 after:w-5 
            peer-checked:after:bg-slate-200 peer-checked:after:border-slate-200
            peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:transition-all 
            peer-checked:bg-slate-600 
            w-11 h-6"></div>
    </label>
</div>