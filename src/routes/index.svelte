<script lang="ts" context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import ScrollingRadio from "$lib/ScrollingRadio.svelte";
	import RadioPreview from "$lib/RadioPreview.svelte";
	import FormGrouping from "$lib/FormGrouping.svelte";
	import Runtime from "$lib/Runtime.svelte";
	import type { GameData, ProjectData, ScrollingRadioData } from "../types";
	import LabelTextArea from "$lib/LabelTextArea.svelte";
	import IconButton from "$lib/IconButton.svelte";

	let previewList: GameData[];
	let scrollingPreviewData: ScrollingRadioData[];
	fetch("https://gitlab.com/api/v4/projects/37664261/repository/files/preview.json/raw?ref=main")
		.then(r => r.json()).then(j => { 
			previewList = j;	
			scrollingPreviewData = previewList.map(
				previewData => ({
					key: previewData.filename,
					component: RadioPreview,
					props: { previewData: previewData }
				})
			);
		});

	let selectedID: string;
	let loading = false;
	let gameData: ProjectData | undefined = undefined;
	function handleGameClick(event: any) {
		loading = true;
		const gameFilename = event.detail.id;
		fetch(`https://gitlab.com/api/v4/projects/37664261/repository/files/games%2F${gameFilename}/raw?ref=main`)
			.then(r => r.json()).then(j => {
				gameData = j;
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
		gameData = loadGameData;
	}
</script>

<svelte:head>
	<title>Mitts-Engine Home</title>
	<meta name="description" content="Mitts-Engine Library" />
</svelte:head>
	
{#if gameData === undefined}
	<div class="flex flex-col items-center space-y-6
		absolute inset-0 p-4">
		<div class="flex flex-col space-y-1 items-center">
			<div class="flex flex-row items-end space-x-2">
				<p class="text-3xl text-slate-300 font-bold">Mitts-Engine Library</p>
				<p class="text-2xl text-slate-400">v1.3.0</p>
			</div>
			<p class="text-slate-400">
				Contributing: through GitLab <a class="text-blue-600" href="https://gitlab.com/strawberria/mitts-engine-games/">here</a>.
			</p>
		</div>
		<FormGrouping class="w-1/2">
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
	<Runtime gameData={gameData} />
{/if}


<style>
    :global(html) {
        background-color: rgba(15, 23, 42, 1);
    }
</style>