<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { Divider, Flex, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
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
    let tagAccordionOpenStore: Writable<boolean[]> = writable([]);
    const currentTagIDStore: Writable<string | undefined> = writable(undefined);

    // Handlers for restraint tag creation
    function createTag(): [string, GameTag] {
        const hintID = randomID("tag");
        return [hintID, { key: "tag" }];
    }

    $: {
        restraintID;
        $tagAccordionOpenStore = [];
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
        {#key restraintID}
            <AccordionHeader label="Tags"
                forceRefresh={true}
                accordionOpenStore={tagAccordionOpenStore}
                currentIDStore={currentTagIDStore}
                orderedData={restraintData.tags}
                callback={() => { restraintData = restraintData }}
                callbackCreate={createTag} />
            <Accordion class="accordion grow">
                {#each restraintData.tags as [tagID, tagData], index}
                    {@const tagsValidData = $bundleValidStore["restraints"]["tags"][restraintIndex]}
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
        {/key}
    </Flex>
</Flex>