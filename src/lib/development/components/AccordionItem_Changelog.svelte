<script lang="ts">
    import { Flex, TextInput, Textarea } from "@svelteuidev/core";
    import type { GameChangelog } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let changelogData: GameChangelog;
    $: { changelogData; validate(); }
</script>

<Flex direction="column" gap="xs">
    <!-- Version, version title, and changelog text -->
    <Flex class="w-full" gap="md">
        <TextInput class="w-[30%]"
            label="Version" 
            placeholder="0.0.0"
            required={true} 
            error={changelogData.version.length == 0} 
            bind:value={changelogData.version} />
        <TextInput class="w-[70%]"
            label="Note" 
            placeholder="Initial Release"
            required={false}
            bind:value={changelogData.note} />
    </Flex>
    <Textarea label="Changelog (Markdown)" 
        placeholder={"- Finished implementing features [X] and [Y]\n- Fixed bugs [A] and [B] blocking progression"}
        rows={4} required={true} error={changelogData.text.length == 0} 
        bind:value={changelogData.text} />
</Flex>