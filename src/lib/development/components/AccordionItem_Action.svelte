<script lang="ts">
    import { Flex, Switch, TextInput } from "@svelteuidev/core";
    import type { GameAction } from "../functions/typings";
    import { validate } from "../functions/validation";

    export let actionData: GameAction;
    $: { actionData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <!-- Action name, junction data (whether to use, ordered, junction) -->
    <TextInput label="Name" 
        placeholder="Unlock"
        required={true} 
        error={actionData.name.length == 0} 
        bind:value={actionData.name} />
    <Flex direction="row" gap="md">
        <Flex class="w-[8.75em] h-[63px] shrink-0"
            direction="column" align="left" justify="center" gap="xs">
            <Switch label="Use Junction" size="sm" 
                bind:checked={actionData.two} />
            <Switch label="Order Matters" size="sm" 
                disabled={!actionData.two} 
                bind:checked={actionData.order} />
        </Flex>
        <TextInput class="grow"
            disabled={!actionData.two}
            label="Junction" placeholder="with"
            required={true} error={actionData.junct.length == 0 && actionData.two} 
            bind:value={actionData.junct} />
    </Flex>
</Flex>