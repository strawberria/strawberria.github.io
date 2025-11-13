<script lang="ts">
    import { ActionIcon, Divider, Flex, Header, Menu, Text } from "@svelteuidev/core";
    import { DoubleArrowDown, Download, Play, Scissors, Trash, Upload } from "radix-icons-svelte";
    import { Gear, List } from "svelte-bootstrap-icons";
    import { gameStore, playingGameStore, quickSave, refreshStore, resetGameData, saveGame } from "$lib/development/functions/project";
    import { trimGameData, validate } from "$lib/development/functions/validation";
    import { currentVersion, updateGameCompatibility } from "$lib/global/functions/project";
    import type { GameSaveData } from "$lib/global/functions/typings";

    // Check whether the current game settings are valid
    let gameValid = false;
    gameStore.subscribe((gameData) => {
        gameValid = false;
        if(gameData.data.actions.length === 0) { return; }
        if(gameData.data.bodyParts.length === 0) { return; }
        if(gameData.data.locations.length === 0) { return; }
        if(gameData.data.states.length === 0) { return; }
        if(gameData.data.states.filter(v => v[1].type === "opening").length === 0) { return; }
        gameValid = true;
    });

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
            reader.readAsText(file)
            reader.onload = () => {
                // Result contains the stringified data
                if(reader.result === "") { return; }
                let fullGameData: GameSaveData = JSON.parse(reader.result as string);
                fullGameData = updateGameCompatibility(fullGameData);
                // Force reload all tab components
                refreshStore.set(true);
                setTimeout(() => { gameStore.set(fullGameData.game); });
                setTimeout(() => { refreshStore.set(false); validate() }, 50);
            }

            browserFileInput.value = "";
        }
    }, 50);

    // Intercept CTRL+S to save game
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault();
            saveGame();
        } else if(event.ctrlKey && event.key === "o") {
            event.preventDefault();
            loadGamePre();
        } else if(event.ctrlKey && event.key === "q") {
            event.preventDefault();
            quickSave();
        }
    });

    // Play game, overlay on top of current dev data
    // Force deep copy of game data to prevent collision?
    function playGame() {
        $playingGameStore = true;
    }
</script>

<Header height="3em">
    <!-- Dummy hidden input element -->
    <input class="hidden" 
        type="file" 
        accept=".json" 
        name="game_data_full" 
        size=1
        bind:this={browserFileInput}>
    <Flex class="h-full p-[0.5em] px-[0.75em]" align="center" gap="xs">
        <Text size="xl">Mitts/Engine Development</Text>
        <Text size="xl" color="$blue400">│</Text>
        <Text size="xl">Version {currentVersion}</Text>
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
                Trim Game (WIP)
            </Menu.Item>
            <!-- <Menu.Item icon={Upload}>Enable Autosave</Menu.Item> -->
        </Menu>
        <Menu bind:this={mainMenu}
            closeOnItemClick={true}>
            <ActionIcon slot="control" 
                on:click={() => { menuClick("main") }}>
                <List />
            </ActionIcon>
            <Menu.Item icon={Play}
                on:click={playGame}
                disabled={gameValid === false}>
                Play Game
            </Menu.Item>
            <Divider />
            <Menu.Item icon={DoubleArrowDown}
                on:click={quickSave}>
                Quicksave
            </Menu.Item>
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