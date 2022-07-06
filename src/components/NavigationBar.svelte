<script lang="ts">
	import { ExportProject, ImportProject } from "../../wailsjs/go/main/Bridge";

	import { MouseClickEvent, NavigationData, ProjectData, projectStore, sleep, version } from "../miscellaneous";
	import IconButton from "../lib/IconButton.svelte";

	export let navigationData: NavigationData;
	export let navigationClickHandler: (navigationKey: string) => void;
	export let selectedWindow: string;
	export let show: boolean; // Held false for a bit when reloading

	async function importClick() {
		const serialized = await ImportProject();
		const newProjectData = JSON.parse(serialized) as ProjectData;
		show = false; await sleep(50); 
		projectStore.set(newProjectData);
		await sleep(50); 
		show = true; 
	}

	async function exportClick() {
		const serialized = JSON.stringify($projectStore);
		await ExportProject(serialized);
	}

	function navigationClick(mouseEvent: MouseClickEvent<HTMLAnchorElement>) {
		const clickedElement = mouseEvent.currentTarget;
		const navigationKey = clickedElement.getAttribute("aria-label") as string;
		navigationClickHandler(navigationKey);
	}
</script>

<nav class="bg-slate-800 text-slate-400">
	<div class="flex flex-row justify-between items-stretch 
		px-4">
		<div class="flex flex-row 
			space-x-4 py-3">
			<div class="flex flex-row 
				space-x-2.5">
				<IconButton label={"Import"}
					onclick={importClick}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
				</IconButton>
				<IconButton label={"Export"}
					onclick={exportClick}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
					</svg>
				</IconButton>
			</div>
			<div class="flex items-center">
				<div class="flex flex-row items-end space-x-2">
					<span class="font-medium text-2xl">DiD-Development</span>
					<span class="text-xl">v{version}</span>
				</div>
			</div>
		</div>
	  	<div class="flex items-center 
		  	space-x-1 pr-2">
			<ul class="flex flex-row text-xl 
				space-x-8">
				{#each Object.entries(navigationData) as [navigationKey, navigationData]}
					<li class="h-full py-2.5">
						<a class={`cursor-pointer select-none ${navigationKey === selectedWindow
								? "text-slate-200"
								: "hover:text-slate-300 focus:text-slate-200"}`}
							aria-label={navigationKey}
							on:click={navigationClick}>
							{navigationData.display}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>