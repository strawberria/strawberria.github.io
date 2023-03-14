<script lang="ts">
    export let height = null;
    let customClass = "";
    export { customClass as class };
</script>

<div class={`w-full
    flex flex-row items-stretch space-x-3
    ${customClass} ${height === null ? "grow" : ""}`}
    style={height !== null
        ? `height: ${height}%` : ""}>
    <slot />
</div>