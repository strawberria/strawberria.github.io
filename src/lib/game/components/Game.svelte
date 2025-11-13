<script lang="ts">
    import { onMount } from "svelte";
    import { initializeGame, lookupStore, progressStore, readyStore } from "$lib/game/functions/progress";
    import { playingGameStore } from "$lib/development/functions/project";
    import StateNormal from "$lib/game/components/StateNormal.svelte";
    import StateOpenTransition from "$lib/game/components/StateTransition.svelte";

    export let showBack: boolean = false;

    // Calculate the maximum number of hints?
    $readyStore = false;
    onMount(async () => {
        const success = initializeGame(); 
        if(success === false) {
            // If fail, return back to devkit
            $playingGameStore = false;
        }
        $readyStore = true;
    });
</script>

<!-- Overlay over current container, page or poup-->
<div class="absolute inset-0 !bg-[#1a1b1e] z-20 select-none">
    {#key $readyStore}
        {#if $readyStore === true}
            {@const currentStateData = $lookupStore.states[$progressStore.state]}
            {#if currentStateData.type === "normal"}
                <StateNormal />
            {:else}
                <StateOpenTransition />
            {/if}
        {:else}
            You shouldn't be seeing this! 
        {/if}
    {/key}
</div>