<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Tag from "$lib/development/components/AccordionItem_Tag.svelte";
    import { bundleValidStore } from "$lib/development/functions/project";
    import { type GameObject, type GameTag } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let objectIndex: number;
    export let objectID: string;
    export let objectData: GameObject;
    $: { objectData; validate(); }
    let tagAccordionOpenStore: Writable<boolean[]> = writable([]);
    const currentTagIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for object tag creation
    function createTag(): [string, GameTag] {
        const hintID = randomID("tag");
        return [hintID, { key: "tag" }];
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
            forceRefresh={true}
            accordionOpenStore={tagAccordionOpenStore}
            currentIDStore={currentTagIDStore}
            orderedData={objectData.tags}
            callback={() => { objectData = objectData }}
            callbackCreate={createTag} />
        <Accordion class="accordion grow">
            {#each objectData.tags as [tagID, tagData], index}
                {@const tagsValidData = $bundleValidStore["objects"]["tags"][objectIndex]}
                <AccordionItem class={tagsValidData[index] 
                        ? "item-valid" : "item-error"}
                    transitionType="slide" transitionParams={{ duration: 200 }}
                    bind:open={$tagAccordionOpenStore[index]}>
                    <Text slot="header" class="min-h-[1.5em] mr-[0.5em]" size="md">
                        {#key $bundleValidStore}
                            {tagData.key}
                        {/key}
                    </Text>
                    <AccordionItem_Tag tagData={tagData} />
                </AccordionItem>
            {/each}
        </Accordion>
    </Flex>
</Flex>