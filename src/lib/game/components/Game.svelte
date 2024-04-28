<script lang="ts">
    import { onMount } from "svelte";
    import { initializeGame, lookupStore, progressStore, readyStore } from "$lib/game/functions/progress";
    import StateEnding from "$lib/game/components/StateEnding.svelte";
    import StateNormal from "$lib/game/components/StateNormal.svelte";
    import StateOpenTransition from "$lib/game/components/StateTransition.svelte";
    import type { GameData } from "$lib/global/functions/typings";

    export let gameData: GameData;
    export let showBack: boolean = false;

    // Calculate the maximum number of hints?
    $readyStore = false;
    onMount(() => {
        initializeGame(gameData); // Sets readyStore to true
        $readyStore = true;
    });
</script>

<!-- Overlay over current container, page or poup-->
<div class="absolute inset-0 !bg-[#1a1b1e] z-20">
    {#if $readyStore === true}
        {@const currentStateData = $lookupStore.states[$progressStore.state]}
        {#if currentStateData.type === "opening" || currentStateData.type === "transition"
            || currentStateData.type === "choice"}
            <StateOpenTransition gameData={gameData} />
        {:else if currentStateData.type === "normal"}
            <StateNormal gameData={gameData} />
        {:else if currentStateData.type === "ending"}
            <StateEnding gameData={gameData} />
        {/if}
    {/if}
</div>
