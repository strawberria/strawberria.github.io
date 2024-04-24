<script lang="ts">
    import { Flex, Text } from "@svelteuidev/core";
    import { ExclamationTriangle } from "radix-icons-svelte";

    export let show: boolean;
    export let text: string;
</script>

<Flex class={show === false ? "invisible" : ""} 
    gap="xs" align="center">
    <ExclamationTriangle color="#fa5252" />
    <Text class="min-h-[1.5em]" size="sm"
        color="red">
        {text}
    </Text> 
</Flex>