<script lang="ts" context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import ScrollingRadio from "$lib/ScrollingRadio.svelte";
	import RadioPreview from "$lib/RadioPreview.svelte";
	import FormGrouping from "$lib/FormGrouping.svelte";
	import GameRuntime from "$lib/GameRuntime.svelte";
	import type { ProjectData } from "../typings";
	import type { GameData, ScrollingRadioData } from "../other";
	import LabelTextArea from "$lib/LabelTextArea.svelte";
	import IconButton from "$lib/IconButton.svelte";
    import { writable, type Writable } from "svelte/store";

	const version = "0.3.0";
	const supportedVersions = ["0.3.0"];

	let previewList: GameData[];
	let scrollingPreviewData: ScrollingRadioData[];
	// fetch("https://gitlab.com/api/v4/projects/37664261/repository/files/preview.json/raw?ref=main")
	fetch("https://raw.githubusercontent.com/strawberria/mitts-engine-games/main/preview.json")
		.then(r => r.json()).then(j => { 
			previewList = j;	
			scrollingPreviewData = previewList.map(
				previewData => ({
					key: previewData.path,
					component: RadioPreview,
					props: { key: previewData.path, previewData: previewData, supportedVersions: supportedVersions }
				})
			);
		});

	let selectedID: string;
	let loading = false;
	let gameDataStore: Writable<ProjectData> = writable(null as any)
	function handleGameClick(event: any) {
		loading = true;
		const gameFolderPath = event.detail.id;
		// fetch(`https://gitlab.com/api/v4/projects/37664261/repository/files/games%2F${gameFilename}/raw?ref=main`)
		fetch(`https://raw.githubusercontent.com/strawberria/mitts-engine-games/main/${gameFolderPath}`)
			.then(r => r.json()).then(j => {
				$gameDataStore = j;
			});
    }

	let disableLoadButton: boolean = true;
	let loadGameDataRaw: string = "";
	let loadGameData: ProjectData | undefined = undefined;
	$: {
		loadGameDataRaw;
		loadGameData = undefined;
		try {
			loadGameData = JSON.parse(loadGameDataRaw);
			disableLoadButton = typeof loadGameData !== "object";
		} catch(_) {
			disableLoadButton = true;
		}
	}
	function handleLoadClick() {
		gameDataStore.set(loadGameData as ProjectData);
	}
</script>

<svelte:head>
	<title>Mitts-Engine Home</title>
	<meta name="description" content="Mitts-Engine Library" />
</svelte:head>
	
{#if $gameDataStore === null}
	<div class="flex flex-col items-center space-y-6
		absolute inset-0 p-4">
		<div class="flex flex-col space-y-1 items-center">
			<div class="flex flex-row items-end space-x-2 mb-3">
				<p class="text-3xl text-slate-300 font-bold">Mitts-Engine Library</p>
				<p class="text-2xl text-slate-400">v{version}</p>
			</div>
			<p class="text-slate-400">
				Download the devkit for creating new games <a class="text-blue-500" target="_blank" href="https://github.com/strawberria/mitts-engine-devkit/">here</a>!
			</p>
			<p class="text-slate-400">
				Contributing games: through GitHub <a class="text-blue-500" target="_blank" href="https://github.com/strawberria/mitts-engine-games/">here</a> - thank you!
			</p>
		</div>
		<FormGrouping class="w-3/5">
			<svelte:fragment slot="header">
				<div class="flex flex-col items-center">
					<p class="text-2xl text-slate-300">Current Games Collection</p>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="content">
				{#if loading === true}
					<p class="text-slate-300 text-xl w-full text-center p-4">
						Loading game...
					</p>
				{:else if scrollingPreviewData === undefined}
					<p class="text-slate-300 text-xl w-full text-center p-4">
						Loading game previews...
					</p>
				{:else}
					<ScrollingRadio bind:selectedID={selectedID} 
						deselectable={true}
						scrollingRadioData={scrollingPreviewData}
						on:dispatchClick={handleGameClick} />
				{/if}
			</svelte:fragment>
		</FormGrouping>
		<FormGrouping class="w-1/2">
			<svelte:fragment slot="header">
				<div class="flex flex-col items-center">
					<p class="text-2xl text-slate-300">Load Game From JSON</p>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="content">
				<LabelTextArea class="mb-2"
				 	label="Game Data"
					bind:value={loadGameDataRaw}
					rows={8} />
				<div class="flex flex-row justify-center">
					<IconButton label={"Load"}
						disabled={disableLoadButton}
						onclick={handleLoadClick} />
				</div>
			</svelte:fragment>
		</FormGrouping>
	</div>
{:else}
	<div class="absolute inset-0 p-3">
		<GameRuntime gameDataStore={gameDataStore} 
			usingDevkit={false} />
	</div>
{/if}


<style>
    :global(html) {
        background-color: rgba(15, 23, 42, 1);
    }
</style>