<script lang="ts">
	import { Flex, Tabs, Text, Tooltip } from '@svelteuidev/core';
	// @ts-ignore
	import { BookmarkHeart, BoxSeam, Compass, Image, SearchHeart, Share } from "svelte-bootstrap-icons";
	import HeaderMenus from '$lib/development/components/pages/App_HeaderMenus.svelte';
    import Images from '$lib/development/components/pages/Images.svelte';
    import Interactions from '$lib/development/components/pages/Interactions.svelte';
    import Locations from '$lib/development/components/pages/Locations.svelte';
    import Metadata from '$lib/development/components/pages/Metadata.svelte';
    import Objects from '$lib/development/components/pages/Objects.svelte';
    import Restraints from '$lib/development/components/pages/Restraints.svelte';
    import States from '$lib/development/components/pages/States.svelte';
    import { currentIssues, refreshStore, validStore } from '$lib/development/functions/project';
    import { ExclamationTriangle } from 'radix-icons-svelte';
</script>

<HeaderMenus />
<Tabs class="absolute w-full tabs"
	orientation="vertical">
	<Tabs.Tab class={$validStore["metadata"] ? undefined : "tab-error"}
		label='Metadata' icon={BookmarkHeart}>
		{#if $refreshStore === false}
			<Metadata />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["states"] ? undefined : "tab-error"}
		label='States' icon={Share}>
		{#if $refreshStore === false}
			<States />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["interaction"] ? undefined : "tab-error"}
		label='Interactions' icon={SearchHeart}>
		{#if $refreshStore === false}
			<Interactions />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["objects"] ? undefined : "tab-error"}
		label='Objects' icon={BoxSeam}>
		{#if $refreshStore === false}
			<Objects />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["restraints"] ? undefined : "tab-error"}
		label='Restraints' icon={BoxSeam}>
		{#if $refreshStore === false}
		<Restraints />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["images"] ? undefined : "tab-error"}
		label='Images' icon={Image}>
		{#if $refreshStore === false}
			<Images />
		{/if}
	</Tabs.Tab>
	<Tabs.Tab class={$validStore["locations"] ? undefined : "tab-error"}
		label='Locations' icon={Compass}>
		{#if $refreshStore === false}
		<Locations />
		{/if}
	</Tabs.Tab>
</Tabs>
<Tooltip class="absolute left-0 bottom-0 text-sm"
	wrapLines width={400} label={currentIssues}>
	<Flex class="mb-[1em] w-[9.875em] items-stretch gap-x-[0.25em] select-none" 
		justify="center" align="center">
		<ExclamationTriangle class="mx-[0.25em]"
			size={24} color="orange" />
		<Text style="color: orange" size="lg">Notice</Text>
	</Flex>
</Tooltip>