<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, randomID, Text, Textarea, TextInput } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Action from "$lib/development/components/AccordionItem_Action.svelte";
    import AccordionItemBodyPart from "$lib/development/components/AccordionItem_BodyPart.svelte";
    import AccordionItem_Changelog from "$lib/development/components/AccordionItem_Changelog.svelte";
    import { gameStore, bundleValidStore } from "$lib/development/functions/project";
    import type { GameAction, GameChangelog, GameBodyPart } from "$lib/global/functions/typings";

    const currentActionIDStore: Writable<string | undefined> = writable(undefined);
    const currentBodyPartIDStore: Writable<string | undefined> = writable(undefined);
    const currentChangelogIDStore: Writable<string | undefined> = writable(undefined);
    let changelogAccordionOpenStore: Writable<boolean[]> = writable([]);
    let actionAccordionOpenStore: Writable<boolean[]> = writable([]);
    let bodyPartAccordionOpenStore: Writable<boolean[]> = writable([]);

    // Handlers for changelogs within the metadata
    function createChangelog(): [string, GameChangelog] {
        const changelogID = randomID("changelog");
        return [changelogID, { version: "0.0.0", note: "Initial Release", text: "" }];
    }

    // Handlers for actions within the metadata
    function createAction(): [string, GameAction] {
        const actionID = randomID("action");
        return [actionID, { name: "New Action", junct: "", two: false, order: false }];
    }

    // Handlers for body parts within the metadata
    function createBodyPart(): [string, GameBodyPart] {
        const bodyPartID = randomID("bodyPart");
        return [bodyPartID, { name: "New Body Part", initial: "", hidden: false }];
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
            forceRefresh={true}
            accordionOpenStore={changelogAccordionOpenStore}
            currentIDStore={currentChangelogIDStore}
            orderedData={$gameStore.metadata.changelogs}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createChangelog} />
        <Accordion class="accordion grow">
            {#each $gameStore.metadata.changelogs as [changelogID, changelogData], index}
                <AccordionItem class={$bundleValidStore["metadata"]["changelogs"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$changelogAccordionOpenStore[index]}>
                    <Text slot="header" class="min-h-[1.5em] mr-[0.5em]" size="md">
                        {#key $bundleValidStore}
                            {#if changelogData.version !== ""}
                                [{changelogData.version}] 
                            {/if}
                            {changelogData.note}
                        {/key}
                    </Text>
                    <AccordionItem_Changelog bind:changelogData={changelogData} />
                </AccordionItem>
            {/each}
        </Accordion>
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[35%]" direction="column">
        <!-- Actions and body parts -->
        <AccordionHeader label="Actions"
            forceRefresh={true}
            accordionOpenStore={actionAccordionOpenStore}
            currentIDStore={currentActionIDStore}
            orderedData={$gameStore.data.actions}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createAction} />
        <Accordion class="accordion h-[50%] mt-[0.625em]">
            {#each $gameStore.data.actions as [actionID, actionData], index}
                <AccordionItem class={$bundleValidStore["metadata"]["actions"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$actionAccordionOpenStore[index]}>
                    <Text slot="header" class="min-h-[1.5em] mr-[0.5em]" size="md">
                        {#key $bundleValidStore}
                            {actionData.name}
                            {#if actionData.two && actionData.junct !== ""}
                                ({actionData.junct})
                            {/if}
                        {/key}
                    </Text>
                    <AccordionItem_Action bind:actionData={actionData} />
                </AccordionItem>
            {/each}
        </Accordion>
        <Divider orientation="horizontal" />  
        <AccordionHeader label="Body Parts"
            forceRefresh={true}
            accordionOpenStore={bodyPartAccordionOpenStore}
            currentIDStore={currentBodyPartIDStore}
            orderedData={$gameStore.data.bodyParts}
            callback={() => { $gameStore = $gameStore }}
            callbackCreate={createBodyPart} />
        <Accordion class="accordion h-[50%] mt-[0.625em]">
            {#each $gameStore.data.bodyParts as [bodyPartID, bodyPartData], index}
                <AccordionItem class={$bundleValidStore["metadata"]["bodyParts"][index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$bodyPartAccordionOpenStore[index]}>
                    <Text slot="header" class="min-h-[1.5em] mr-[0.5em]" size="md">
                        {#key $bundleValidStore}
                            {bodyPartData.name}
                        {/key}
                    </Text>
                    <AccordionItemBodyPart bind:bodyPartID={bodyPartID}
                        bind:bodyPartData={bodyPartData} />
                </AccordionItem>
            {/each}
        </Accordion>
    </Flex>
</Flex>