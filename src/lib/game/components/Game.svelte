<script lang="ts">
    import { onMount } from "svelte";
    import { initializeGame, lookupStore, progressStore, readyStore } from "$lib/game/functions/progress";
    import StateNormal from "$lib/game/components/StateNormal.svelte";
    import StateOpenTransition from "$lib/game/components/StateTransition.svelte";

    export let showBack: boolean = false;

    // Calculate the maximum number of hints?
    $readyStore = false;
    onMount(() => {
        initializeGame(); // Sets readyStore to true
        $readyStore = true;
    });
</script>

<!-- Overlay over current container, page or poup-->
<div class="absolute inset-0 !bg-[#1a1b1e] z-20 select-none">
    {#if $readyStore === true}
        {@const currentStateData = $lookupStore.states[$progressStore.state]}
        {#if currentStateData.type === "normal"}
            <StateNormal />
        {:else}
            <StateOpenTransition />
        {/if}
    {:else}
        BOOF
    {/if}
</div>