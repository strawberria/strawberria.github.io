<script lang="ts">
    import { Flex, TextInput } from "@svelteuidev/core";
    import type { GameTag } from "../functions/typings";
    import { validate } from "../functions/validation";

    export let tagData: GameTag;
    $: { tagData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <TextInput label="Tag" 
        placeholder="Unlock"
        required={true} 
        error={tagData.key.length == 0} 
        bind:value={tagData.key} />
</Flex>