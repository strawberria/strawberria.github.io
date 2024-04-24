<script lang="ts">
    import { Flex, NumberInput, TextInput, Textarea } from "@svelteuidev/core";
    import type { GameStateHint } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let hintData: GameStateHint;
    $: { hintData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <!-- Version, version title, and changelog text -->
    <Flex class="w-full" gap="md">
        <TextInput class="w-[70%]"
            label="Title" 
            placeholder="Reaching the knife"
            required={true} 
            error={hintData.title.length == 0} 
            bind:value={hintData.title} />
        <NumberInput class="w-[30%]"
            label="Attempts"
            placeholder="0"
            min={1}
            step={1}
            required={true}
            error={hintData.attempts < 0 || Number.isInteger(hintData.attempts) === false}
            bind:value={hintData.attempts} />
    </Flex>
    <Textarea label="Text (Markdown)" 
        placeholder={"The scissors lie just barely out of your reach, what could you use to reach just that little bit farther?"}
        rows=4 required={true} error={hintData.text.length == 0} 
        bind:value={hintData.text} />
</Flex>