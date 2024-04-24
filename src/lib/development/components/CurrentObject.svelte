<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Accordion, Divider, Flex, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Tag from "$lib/development/components/AccordionItem_Tag.svelte";
    import { bundleValidStore } from "$lib/development/functions/project";
    import { type GameObject, type GameTag } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let objectIndex: number;
    export let objectID: string;
    export let objectData: GameObject;
    $: { objectData; validate(); }
    const currentTagIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for object tag creation
    function createTag(): [string, GameTag] {
        const hintID = randomID("tag");
        return [hintID, { key: "tag" }];
    }
    function tagOnChange(event: CustomEvent<string | string[] | null>) {
        $currentTagIDStore = event.detail === null
            ? undefined : Array.isArray(event.detail)
            ? event.detail[0] : event.detail;
    }
</script>

<Flex class="h-full" gap="sm">
    <Flex class="w-[50%]" direction="column" gap="xs">
        <TextInput label="Name" 
            placeholder="Scissors"
            required={true} 
            error={objectData.name.length == 0} 
            bind:value={objectData.name} />
        <Textarea class="grow-[2]"
            label="Examine" 
            placeholder={
                "A dull pair of craft scissors, probably repurposed from a grade-school classroom somewhere."
            }
            required={true} 
            error={objectData.examine.length == 0} 
            rows={4}
            bind:value={objectData.examine} />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[50%]" direction="column" gap="xs">
        <AccordionHeader label="Tags"
            currentIDStore={currentTagIDStore}
            orderedData={objectData.tags}
            callback={() => { objectData = objectData }}
            callbackCreate={createTag} />
        <Accordion class="overflow-auto grow"
            defaultValue={undefined}
            on:change={tagOnChange}>
            {#each objectData.tags as [tagID, tagData], index}
                {@const tagsValidData = $bundleValidStore["objects"]["tags"][objectIndex]}
                <Accordion.Item class={tagsValidData[index] 
                        ? "item-valid" : "item-error"}
                    value={tagID}>
                    <Text slot="control" class="min-h-[1.5em]" size="md">
                        {#key $bundleValidStore}
                            {tagData.key}
                        {/key}
                    </Text>
                    <AccordionItem_Tag tagData={tagData} />
                </Accordion.Item>
            {/each}
        </Accordion>
    </Flex>
</Flex>