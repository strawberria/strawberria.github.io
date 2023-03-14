<script lang="ts">
    export let width = null;
    let customClass = "";
    let customStyle = "";
    export { customClass as class, customStyle as style };
</script>

<div class={`h-full
    flex flex-col items-stretch space-y-3
    ${customClass} ${width === null && customStyle === "" ? "grow" : ""}`}
    style={`${customStyle}; ${width !== null
        ? `width: ${width}%` : ""}`}>
    <slot />
</div>