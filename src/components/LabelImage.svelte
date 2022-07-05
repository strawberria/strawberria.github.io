<script lang="ts">
    export let label: string;
    export let imageData: string; // base64 encoded
    let customClass: string = "";
    export { customClass as class };
</script>

<div class={`grow flex flex-col items-start space-y-0.5
    ${customClass}`}>
    <p class="pl-1 
        text-slate-400 text-sm">
        {label}
    </p>
    <div class="grow flex flex-col basis-0 min-h-0">
        {#if imageData !== ""}
            <img class="border border-slate-500 p-2
                object-contain max-h-full w-full"
                height="100%" 
                src={imageData}
                alt={""}/>
        {/if}
    </div>
</div>