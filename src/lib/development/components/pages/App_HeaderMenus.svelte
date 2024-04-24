<script lang="ts">
    import { ActionIcon, Divider, Flex, Header, Menu, Text } from "@svelteuidev/core";
    import { DoubleArrowDown, Download, Scissors, Trash, Upload } from "radix-icons-svelte";
    import { Gear, List } from "svelte-bootstrap-icons";
    import { autosaveStore, gameStore, quickSave, refreshStore, resetGameData, saveGame } from "../../functions/project";
    import { trimGameData } from "$lib/development/functions/validation";
    import { currentVersion } from "$lib/global/functions/project";
    import type { GameSaveData } from "$lib/global/functions/typings";

    // Whenever one menu button clicked, close the other menu
    let settingsMenu: any; 
    let mainMenu: any;
	function menuClick(which: string) {
		if(which == "settings") { 
			mainMenu.close();
		} else if(which == "main") {
			settingsMenu.close();
		}
	}

    // Three-second countdown before being allowed to reset project
    let countdownValue = -1;
    let currentInterval = -1;
    function clickResetProject() {
        if(countdownValue === -1 && currentInterval === -1) {
            countdownValue = 3;
            currentInterval = setInterval(() => {
                if(countdownValue > 0) {
                    countdownValue--;
                } else {
                    clearInterval(currentInterval);
                    currentInterval = -1;
                }
            }, 1000) as any;
        } else if(countdownValue === 0) {
            // Reset project here and close menu
            // Need timeout otherwise menu doesn't close
			setTimeout(() => { mainMenu.close() });
            setTimeout(() => { countdownValue = -1; }, 100);
            resetGameData();
        } // Don't do anything if currently counting down
    }

    // Trim game data before setting, can't trim on validation because of loop
    function manualTrimGameData() {
        const trimmedGameData = trimGameData($gameStore);
        gameStore.set(trimmedGameData);
    }

    // Dummy element for selecting files
    let browserFileInput: HTMLInputElement;
    function loadGamePre() {
        // Click the browser file input
        browserFileInput.click();
    }

    // Since onChange doesn't work, manually check every 50ms for new file
    setInterval(() => {
        if(!browserFileInput) { return; }
        if(browserFileInput?.files?.length === 1) {
            // Load the given file, then clear afterwards
            const file = browserFileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onload = () => {
                // Result contains the stringified data
                if(reader.result === "") { return; }
                const fullGameData: GameSaveData = JSON.parse(reader.result as string);
                // Force reload all tab components
                refreshStore.set(true);
                autosaveStore.set(fullGameData.version === currentVersion);
                setTimeout(() => { gameStore.set(fullGameData.game); });
                setTimeout(() => { refreshStore.set(false) }, 50);
            }

            browserFileInput.value = "";
        }
    }, 50);
</script>

<Header height="3em">
    <Flex class="h-full p-[0.5em] px-[0.75em]" align="center" gap="xs">
        <Text size="xl">Mitts/Engine Development</Text>
        <Text size="xl" color="$blue400">│</Text>
        <Text size="xl">Version 0.1.0</Text>
        <Text size="xl" color="$blue400">│</Text>
        <Text size="xl">@strawberria</Text>
        <div class="grow" />
        <Menu bind:this={settingsMenu}
            closeOnItemClick={true}>
            <ActionIcon slot="control" 
                on:click={() => { menuClick("settings") }}>
                <Gear />
            </ActionIcon>
            <Menu.Item icon={Scissors}
                on:click={manualTrimGameData}>
                Trim Game Data (WIP)
            </Menu.Item>
            <!-- <Menu.Item icon={Upload}>Enable Autosave</Menu.Item> -->
        </Menu>
        <Menu bind:this={mainMenu}
            closeOnItemClick={true}>
            <ActionIcon slot="control" 
                on:click={() => { menuClick("main") }}>
                <List />
            </ActionIcon>
            <Menu.Item icon={DoubleArrowDown}
                on:click={quickSave}>
                Quicksave
            </Menu.Item>
            <!-- Dummy hidden input element -->
            <input class="hidden" 
                type="file" 
                accept=".json" 
                name="game_data_full" 
                size=1
                bind:this={browserFileInput}>
            <Menu.Item icon={Download}
                on:click={saveGame}>
                Save Game
            </Menu.Item>
            <Menu.Item icon={Upload}
                on:click={loadGamePre}>
                Load Game
            </Menu.Item>
            <Divider />
            <Menu.Item color="red" icon={Trash}
                on:click={clickResetProject}>
                <Text color="inherit">
                    {#if countdownValue !== -1}
                        Are you sure? 
                        {#if countdownValue !== 0}
                            {countdownValue}
                        {/if}
                    {:else}
                        Reset Project
                    {/if}
                </Text>
            </Menu.Item>
        </Menu>
    </Flex>
</Header>