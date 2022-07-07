<script lang="ts" context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import ScrollingRadio from "$lib/ScrollingRadio.svelte";
	import RadioPreview from "$lib/RadioPreview.svelte";
	import FormGrouping from "$lib/FormGrouping.svelte";
	import Runtime from "$lib/Runtime.svelte";
	import type { GameData, ProjectData, ScrollingRadioData } from "../types";

	let previewList: GameData[];
	let scrollingPreviewData: ScrollingRadioData[];
	fetch("https://gitlab.com/api/v4/projects/37631295/repository/files/preview.json/raw?ref=main")
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
	function handleClick(event: any) {
		loading = true;
		const gameFilename = event.detail.id;
		fetch(`https://gitlab.com/api/v4/projects/37631295/repository/files/games%2F${gameFilename}/raw?ref=main`)
			.then(r => r.json()).then(j => {
				gameData = j;
			});
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
			<p class="text-3xl text-slate-300">Mitts-Engine Library</p>
			<p class="text-slate-400">
				Contributing: through GitLab <a class="text-blue-600" href="https://gitlab.com/strawberria/mitts-engine-games/">here</a>, commit your game within the games folder.
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
						on:dispatchClick={handleClick} />
				{/if}
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