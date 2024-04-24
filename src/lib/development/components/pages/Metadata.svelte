<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Accordion, Divider, Flex, randomID, Text, Textarea, TextInput } from "@svelteuidev/core";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Action from "$lib/development/components/AccordionItem_Action.svelte";
    import AccordionItemBodyPart from "$lib/development/components/AccordionItem_BodyPart.svelte";
    import AccordionItem_Changelog from "$lib/development/components/AccordionItem_Changelog.svelte";
    import { gameStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameAction, GameChangelog, GameBodyPart } from "$lib/global/functions/typings";

    const currentActionIDStore: Writable<string | undefined> = writable(undefined);
    const currentBodyPartIDStore: Writable<string | undefined> = writable(undefined);
    const currentChangelogIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for changelogs within the metadata
    function createChangelog(): [string, GameChangelog] {
        const changelogID = randomID("changelog");
        return [changelogID, { version: "0.0.0", note: "Initial Release", text: "" }];
    }
    function changelogOnChange(event: CustomEvent<string | string[] | null>) {
        $currentChangelogIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }

    // Handlers for actions within the metadata
    function createAction(): [string, GameAction] {
        const actionID = randomID("action");
        return [actionID, { name: "New Action", junct: "", two: false, order: false }];
    }
    function actionOnChange(event: CustomEvent<string | string[] | null>) {
        $currentActionIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }

    // Handlers for body parts within the metadata
    function createBodyPart(): [string, GameBodyPart] {
        const bodyPartID = randomID("bodyPart");
        return [bodyPartID, { name: "New Body Part", initial: "", hidden: false }];
    }
    function bodyPartOnChange(event: CustomEvent<string | string[] | null>) {
        $currentBodyPartIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<!-- {#key $bundleValidStore} necessary because using class= breaks reactivity -->
<Flex class="!h-[calc(100vh-4.75em)]" justify="space-between" gap="sm">
    <Flex class="w-[30%]" direction="column" gap="xs">
        <!-- Game title, developer, version, description -->
        <TextInput label="Title" 
        placeholder="Warehouse Abduction"
            required={true} 
            error={$gameStore.metadata.title.length == 0} 
            bind:value={$gameStore.metadata.title} />
        <Flex class="w-full" gap="md">
            <TextInput class="w-[60%]" 
                label="Developer" 
                placeholder="strawberria"
                required={true} 
                error={$gameStore.metadata.developer.length == 0} 
                bind:value={$gameStore.metadata.developer} />
            <TextInput class="w-[40%]" 
                label="Game Version" 
                placeholder="0.1.0"
                required={true} 
                error={$gameStore.metadata.version.length == 0} 
                bind:value={$gameStore.metadata.version} />
        </Flex>
        <Textarea class="textarea-auto grow"
            label="Description (Markdown)" 
            placeholder="Upon discovering a *seemingly* abandoned warehouse, Katie couldn't resist her curiosity and snuck inside for a quick peek..." 
            required={true} error={$gameStore.metadata.description.length == 0} 
            bind:value={$gameStore.metadata.description} />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[35%] overflow-auto" direction="column" gap="xs">
        <!-- Version changelogs -->
        <AccordionHeader label="Version Changelogs"
            currentIDStore={currentChangelogIDStore}
            orderedData={$gameStore.metadata.changelogs}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createChangelog} />
        <Accordion class="overflow-auto h-full"
            defaultValue={undefined}
            on:change={changelogOnChange}>
            {#each $gameStore.metadata.changelogs as [changelogID, changelogData], index}
                <Accordion.Item 
                    class={$bundleValidStore["metadata"]["changelogs"][index] 
                        ? "item-valid" : "item-error"}
                    value={changelogID}>
                    <Text slot="control" class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {#if changelogData.version !== ""}
                                [{changelogData.version}] 
                            {/if}
                            {changelogData.note}
                        {/key}
                    </Text>
                    <AccordionItem_Changelog bind:changelogData={changelogData} />
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[35%]" direction="column">
        <!-- Actions and body parts -->
        <AccordionHeader label="Actions"
            currentIDStore={currentActionIDStore}
            orderedData={$gameStore.data.actions}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createAction} />
        <Accordion class="overflow-auto h-[calc(50%-2.625em)] mt-[0.625em]"
            defaultValue={undefined}
            on:change={actionOnChange}>
            {#each $gameStore.data.actions as [actionID, actionData], index}
                <Accordion.Item 
                    class={$bundleValidStore["metadata"]["actions"][index] 
                        ? "item-valid" : "item-error"}
                    value={actionID}>
                    <Text slot="control" class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {actionData.name}
                            {#if actionData.two && actionData.junct !== ""}
                                ({actionData.junct})
                            {/if}
                        {/key}
                    </Text>
                    <AccordionItem_Action bind:actionData={actionData} />
                </Accordion.Item>
            {/each}
        </Accordion>
        <Divider orientation="horizontal" />  
        <AccordionHeader label="Body Parts"
            currentIDStore={currentBodyPartIDStore}
            orderedData={$gameStore.data.bodyParts}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createBodyPart} />
        <Accordion class="overflow-auto h-1/2 mt-[0.625em]"
            defaultValue={undefined}
            on:change={bodyPartOnChange}>
            {#each $gameStore.data.bodyParts as [bodyPartID, bodyPartData], index}
                <Accordion.Item 
                    class={$bundleValidStore["metadata"]["bodyParts"][index] 
                        ? "item-valid" : "item-error"}
                    value={bodyPartID}>
                    <Text slot="control" class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {bodyPartData.name}
                        {/key}
                    </Text>
                    <AccordionItemBodyPart bind:bodyPartData={bodyPartData} />
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
</Flex>