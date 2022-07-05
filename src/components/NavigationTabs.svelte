<script lang="ts">
    import type { NavigationData } from "../miscellaneous";

    // By default, show the "left-most" window on startingization
    export let navigationData: NavigationData;
    export let selectedWindow: string;
    export const navigateTab = (navigationKey: string) => {
        selectedWindow = navigationKey;
    }
</script>

<div class="relative grow">
    {#each Object.entries(navigationData) as [navigationKey, navigationData]}
        <div class="absolute inset-0 bg-background text-slate-300 p-4"
            class:shown={selectedWindow === navigationKey}
            class:not-shown={selectedWindow !== navigationKey}>
            <svelte:component this={navigationData.component} />
        </div>
    {/each}
</div>  

<style>
    .shown { z-index: 20 }
    .not-shown { z-index: 10 }
</style>