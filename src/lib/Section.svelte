<script lang="ts">
    export let height = null;
    export let width = null;
    export let nogrow = false;
    export let nowidth = false;
    // Hacky workaround for when header forcibly defined but empty
    export let noheader = false;
    export let smallHeader = false;
    export let onclick: () => void = () => {};
    export let label = "";
    let customClass: string = "";
    export let customStyle: string = "";
    export let innerClass: string = "";
    export { customClass as class, customStyle as style };
</script>

<div class={`min-h-0
    flex flex-col items-center space-y-1 pt-2
    ${nowidth ? "": "w-full"}
    ${($$slots.header || label !== "") && !noheader ? "pb-4" : "pb-3"} 
    pl-3 pr-3 rounded-md
    bg-slate-800
    ${customClass}
    ${height === null && width === null && nogrow === false && customStyle === "" ? "grow" : ""}`}
    style={`${customStyle}; ` + (width !== null ? `width: ${width}%;` : "")
        + (height !== null ? `height: ${height}%;` : "")}
    on:click={onclick}>
    {#if label !== ""}
        <div class={`flex flex-row w-full
            select-none mt-1 
            ${smallHeader ? "px-2" : "px-4"}
            ${$$slots["pre-content"] || smallHeader ? "mb-1" : "mb-2"}`}>
            <div class={`flex flex-col justify-center ${$$slots.header && !noheader ? "" : "w-full"}`}>
                <p class={smallHeader ? "text-lg font-semibold" : "text-xl"}>{label}</p>
            </div>
            <div class="grow" />
            <slot name="header" />
        </div>
    {/if}
    <slot name="pre-content" />
    <div class={`flex flex-col w-full space-y-2 text-slate-400 ${innerClass}`}>
        <slot name="content" />
    </div>
</div>