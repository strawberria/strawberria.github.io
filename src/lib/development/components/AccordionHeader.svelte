<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { ActionIcon, Flex } from "@svelteuidev/core";
    import { Minus, Plus, ArrowDown, ArrowUp, Copy } from 'radix-icons-svelte';
    import TextLabel from "$lib/development/components/TextLabel.svelte";
    import { type OrderedData } from "$lib/global/functions/typings";

    let _class: string = ""; export { _class as class };
    export let label: string;
    export let accordionOpenStore: Writable<boolean[]>; // Flowbite
    export let currentIDStore: Writable<string | undefined>;
    export let orderedData: OrderedData<any>;
    export let callback: () => void = () => {}; 
    // Callbacks before and after creation and deletion
    // Does duplicate need callbacks?
    export let callbackCreate: () => [string, any];
    export let callbackCreatePre: () => void = () => {};
    export let callbackCreatePost: () => void = () => {};
    export let callbackDeletePre: () => void = () => {};
    export let callbackDeletePost: () => void = () => {};

    // Whenever accordionOpenStore changes, re-calculate current ID store
    accordionOpenStore.subscribe(accordionOpen => {
        let openIndex = accordionOpen.findIndex(val => val);
        $currentIDStore = undefined;
        $currentIDStore = openIndex !== -1
            ? orderedData[openIndex][0] : undefined;
    });
    function setCurrentIDStore(id: string | undefined) {
        // Set accordion open before setting current ID?
        $accordionOpenStore = orderedData
            .map(([dataID]) => id === dataID);
        $currentIDStore = id;
    }

    // Delete item, calling pre and post callbacks
    // Select the item right below if applicable, otherwise the item above, otherwise none
    function deleteItem() {
        if($currentIDStore === undefined) { return; }

        callbackDeletePre();
        const index = orderedData.findIndex((value) => value[0] === $currentIDStore);
        orderedData.splice(index, 1);
        callbackDeletePost();

        // Check whether the item below is valid
        if(orderedData[index] !== undefined) {
            setCurrentIDStore(orderedData[index][0]);
        } else if(orderedData[index - 1] !== undefined) {
            setCurrentIDStore(orderedData[index - 1][0]);
        } else {
            setCurrentIDStore(undefined);
        }

        callback();
    }

    // Create item, calling pre and cost callbacks
    // Don't automatically select the new item
    function createItem() {
        callbackCreatePre();
        const [id, itemData] = callbackCreate();
        orderedData.push([id, itemData]);
        callbackCreatePost();
        callback();
    }

    // Copy currently selected item, appending to end
    // Don't automatically select the new item
    function copyItem() {
        if($currentIDStore === undefined) { return; }

        const currentItemRaw = orderedData.find(data => data[0] === $currentIDStore);
        if(currentItemRaw === undefined) { return; } // Shouldn't happen
        const currentItem = currentItemRaw[1];
        
        // Deep copy the item using JSON fancy shenanigans
        const [id, _] = callbackCreate();
        const copiedItem = JSON.parse(JSON.stringify(currentItem));
        orderedData.push([id, copiedItem]);
        // callbackCreatePost();
        callback();
    }

    // Move currently selected item down
    function moveItemDown() { 
        if($currentIDStore === undefined) { return; }

        const index = orderedData.findIndex((value) => value[0] === $currentIDStore);
        if(index === orderedData.length - 1) { return; }
        const tempValue = orderedData[index + 1];
        orderedData[index + 1] = orderedData[index];
        orderedData[index] = tempValue;
        callback();
    }

    // Move currently selected item up
    function moveItemUp() { 
        if($currentIDStore === undefined) { return; }

        const index = orderedData.findIndex((value) => value[0] === $currentIDStore);
        if(index === 0) { return; }
        const tempValue = orderedData[index - 1];
        orderedData[index - 1] = orderedData[index];
        orderedData[index] = tempValue;
        callback();
    }
</script>

<Flex class={`w-full space-x-[0.25em] ${_class}`} direction="row">
    <TextLabel class="mt-[0.5em] !mb-[-0.25em]">{label}</TextLabel>
    <div class="grow" />
    <ActionIcon variant="light"
        on:click={deleteItem}>
        <Minus />
    </ActionIcon>
    <ActionIcon variant="light"
        on:click={createItem}>
        <Plus />
    </ActionIcon>
    <ActionIcon variant="light"
        on:click={copyItem}>
        <Copy />
    </ActionIcon>
    <ActionIcon variant="light"
        on:click={moveItemDown}>
        <ArrowDown />
    </ActionIcon>
    <ActionIcon variant="light"
        on:click={moveItemUp}>
        <ArrowUp />
    </ActionIcon>
</Flex>