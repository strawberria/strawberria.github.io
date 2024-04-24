<script lang="ts">
    import { Divider, Flex } from "@svelteuidev/core";
</script>

<!-- {#key $bundleValidStore} necessary because using class= breaks reactivity -->
<Flex class="!h-[calc(100vh)]" justify="space-between" gap="sm">
    <Flex class="w-[30%]" direction="column" gap="xs">
        
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[40%]" direction="column" gap="xs">
        
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[30%]" direction="column">
        
    </Flex>
</Flex>