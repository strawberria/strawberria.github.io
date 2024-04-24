<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Accordion, Divider, Flex, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import AccordionItem_Tag from "$lib/development/components/AccordionItem_Tag.svelte";
    import SelectBodyPart from "$lib/development/components/SelectBodyPart.svelte"
    import { bundleValidStore } from "$lib/development/functions/project";
    import { type GameRestraint, type GameTag } from "$lib/global/functions/typings";
    import { validate } from "$lib/development/functions/validation";

    export let restraintIndex: number;
    export let restraintID: string;
    export let restraintData: GameRestraint;
    $: { restraintData; validate(); }
    const currentTagIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for restraint tag creation
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
        <Flex class="w-full" gap="md">
            <TextInput class="w-[65%]"
                label="Name" 
                placeholder="Handcuffs"
                required={true} 
                error={restraintData.name.length == 0} 
                bind:value={restraintData.name} />
            <SelectBodyPart class="w-[35%]"
                label="Body Part"
                on:change={() => { restraintData = restraintData }}
                bind:selectedBodyPartID={restraintData.bodyPart} />
        </Flex>
        <Textarea class="grow-[2]"
            label="Examine" 
            placeholder={
                "A cold and sturdy pair of police-grade handcuffs, locked tightly around your wrists."
            }
            required={true} 
            error={restraintData.examine.length == 0} 
            rows={4}
            bind:value={restraintData.examine} />
    </Flex>
    <Divider orientation="vertical" /> 
    <Flex class="w-[50%]" direction="column" gap="xs">
        <AccordionHeader label="Tags"
            currentIDStore={currentTagIDStore}
            orderedData={restraintData.tags}
            callback={() => { restraintData = restraintData }}
            callbackCreate={createTag} />
        <Accordion class="overflow-auto grow"
            defaultValue={undefined}
            on:change={tagOnChange}>
            {#each restraintData.tags as [tagID, tagData], index}
                {@const tagsValidData = $bundleValidStore["restraints"]["tags"][restraintIndex]}
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