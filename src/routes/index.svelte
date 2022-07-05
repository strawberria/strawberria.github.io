<script lang="ts" context="module">
	import type { Load } from "@sveltejs/kit";
	import { base } from "$app/paths";
	import { timeSince } from "../utilities";

	// Retrieve list of games previews on initial load
	export const load: Load = async ({ fetch }) => {
		// Get list of current games from backend
		const gamesResponse = await fetch(`${base}/games`);
		// Get last time the "games" folder was updated
		const updateResponse = await fetch("https://api.github.com/repos/strawberria/strawberria.github.io/commits?path=static/games&page=1&per_page=1");
		const updateJSON = await updateResponse.json();

		// Set differenceStr if API fails
		let differenceStr: string = "???";
		if(updateJSON.length !== undefined && updateJSON.length > 0) {
			const updateTime = new Date(updateJSON[0].commit.author.date);
			differenceStr = timeSince(updateTime);
		}

		return {
			status: 200,
			props: { 
				previewList: gamesResponse.ok && (await gamesResponse.json()),
				differenceStr: differenceStr,
			}
		};
	};
</script>

<script lang="ts">
	import ScrollingRadio from "$lib/ScrollingRadio.svelte";
	import RadioPreview from "$lib/RadioPreview.svelte";
	import FormGrouping from "$lib/FormGrouping.svelte";
	import type { PreviewGameData, ScrollingRadioData } from "../types";

	export let previewList: PreviewGameData[];
	export let differenceStr: string[];

	const scrollingPreviewData: ScrollingRadioData[] = previewList.map(
		previewData => ({
			key: previewData.ref,
			component: RadioPreview,
			props: { previewData: previewData }
		})
	);
	let selectedID: string;
</script>

<svelte:head>
	<title>DiD-Engine Home</title>
	<meta name="description" content="DiD-Engine Library" />
</svelte:head>

<div class="flex flex-col items-center space-y-6
	absolute inset-0 p-4">
	<div class="flex flex-col space-y-1 items-center">
		<p class="text-3xl text-slate-300">DiD-Engine Library</p>
		<p class="text-slate-400">
			Contributing: for each game, please create a new branch, then commit and submit pull-requests to as needed.
		</p>
	</div>
	<FormGrouping class="w-1/2">
		<svelte:fragment slot="header">
			<div class="flex flex-col items-center">
				<p class="text-2xl text-slate-300">Current Games Library</p>
				<p class="text-lg text-slate-400">Last updated {differenceStr}</p>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<ScrollingRadio bind:selectedID={selectedID} 
				deselectable={true}
				scrollingRadioData={scrollingPreviewData} />
		</svelte:fragment>
	</FormGrouping>
</div>

<style>
    :global(html) {
        background-color: rgba(15, 23, 42, 1);
    }
</style>