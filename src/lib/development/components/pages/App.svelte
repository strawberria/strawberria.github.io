<script lang="ts">
	import { SvelteUIProvider } from '@svelteuidev/core';
	import { Tabs } from '@svelteuidev/core';
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
    import { refreshStore, validStore } from '$lib/development/functions/project';
</script>

<SvelteUIProvider class="w-full"
	withGlobalStyles themeObserver={'dark'}>
	<!-- Manual app container since AppShell is completely broken -->
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
</SvelteUIProvider>

<style lang="scss">
	:global(.tabs:not(.tabs-small) > div > div > button) {
		padding-bottom: 3px
	}
	:global(.svelteui-Tab-inner > svg) {
		margin-top: 3px;
	}

	:global(.textarea-auto) {
		display: flex;
		flex-direction: column;
	}
	:global(.textarea-auto > div.svelteui-Input-root) {
		flex-grow: 1;
	}
	:global(.textarea-auto > div > textarea) {
		height: 100% !important;
	}

	// Global error outline for accordion items
	:global(.item-error > button) {
		box-shadow: 0 0 0 1px #fa5252 inset !important;
	}

	:global(.svelteui-Tab:hover) {
		background-color: #24252a !important;
	}

	:global(.svelteui-Divider-root) {
		border-color: rgb(55, 58, 64) !important;
	}

	:global(.svelteui-Text-root) {
		line-height: inherit !important;
	}

	:global(.svelteui-Menu-body) {
		padding: 0.5em !important;
	}

	:global(.svelteui-Accordion-root) {
		// padding-right: 0.5em !important;
	}

	// If error, the option text also turns red!
	:global(.svelteui-Input-invalid) {
		color: #c1c2c5 !important;
	}
	:global(.svelteui-Input-invalid > option) {
		color: #c1c2c5 !important;
	}

	:global(.svelteui-AccordionItem-root > button) {
		padding-left: 1em !important;
		padding-right: 0.5em !important;
		background-color: #24252a !important;
	}
	:global(.svelteui-AccordionItem-root > button:hover) {
		background-color: #2d2f35 !important;
	}
	:global(.svelteui-AccordionItem-root > button > span.svelteui-AccordionItem-chevron) {
		margin-left: 0.25em !important;
	}

	:global(.svelteui-AccordionItem-root > button > .svelteui-AccordionItem-controlContent) {
		padding-top: 0.5em !important;
		padding-bottom: 0.5em !important;
	}

	// Repurposing the accordion to a select
	:global(.svelteui-Accordion-root.accordion-select > div > button > .svelteui-AccordionItem-chevron) {
		display: none;
	}
	:global(.svelteui-Accordion-root.accordion-select > div > div > div > div > div) {
		padding: 0 !important;
	}
	:global(.svelteui-Accordion-root.accordion-select > div.__svelteui-ref-active > button) {
		background-color: #3f424b !important;
	}

	// :global(.svelteui-AccordionItem-panel) {
	// 	padding: 0.5em 1em 0.5em 1em !important
	// }

	:global(.tab-error) {
		color: #fa5252 !important;
		text-decoration: underline;
		text-decoration-color: #fa5252;
		text-decoration-thickness: 1px;
		text-underline-offset: 4px;
	}

	:global(.tabs) {
		height: calc(100% - 3em) !important;
	}
	:global(.tabs-small > .tabs-content) {
		padding: 0.25em !important;
		padding-top: 0.75em !important;
		flex-grow: 1 !important;
	}
	:global(.tabs-small > div.svelteui-Tabs-wrapper > div > button) {
		font-size: var(--svelteui-fontSizes-sm) !important;
		height: 2.5em !important;
	}

	:global(.tabs-content) {
		padding: 1em !important;
		padding-top: 0.75em !important;
	}
	
    :global(::placeholder) {
		color: #909296 !important;
	}

	:global(input) {
		padding-right: 0.75em !important;
	}
	:global(textarea) {
		padding: 0.5em 0.75em 0.5em 0.75em !important;
	}
</style>