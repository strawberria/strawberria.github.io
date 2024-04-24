<script lang="ts">
    import { Text } from "@svelteuidev/core";

    let _class: string = "";
    export { _class as class };
</script>

<Text class={`mb-[0.5em] ${_class}`} size="sm" weight="semibold"><slot /></Text>