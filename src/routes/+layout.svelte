<script lang="ts">
    import { SvelteUIProvider } from "@svelteuidev/core";
	import "../app.css";
</script>

<SvelteUIProvider class="w-full"
	withGlobalStyles themeObserver={'dark'}>
	<slot />
</SvelteUIProvider>

<style lang="scss">
	:global(.accordion > h2 > button) {
		background-color: #24252a !important;
		padding: 0.5em 1em 0.5em 1em !important;
		border-radius: 0px !important;
		color: #c1c2c5 !important;
		min-height: 2.625em;
	}
	:global(.accordion > h2 > button > div) {
		width: 100%;
	}
	:global(.accordion > h2 > button:not(.item-error)) {
		box-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
	}
	:global(.accordion > div > div) {
		border-left: 0;
		border-right: 0;
		padding: 1em;
	}
	:global(.accordion.accordion-select > div) {
		display: none
	}
	:global(.accordion.accordion-select > h2 > button > svg) {
		display: none
	}
	:global(.accordion.accordion-select > div > div) {
		padding: 0 !important;
	}
	:global(.accordion > h2 > button:hover) {
		background-color: #2d2f35 !important;
	}
	:global(.accordion > h2 > button[aria-expanded="true"]) {
		background-color: #3f424b !important;
	}

	:global(.accordion-item) {
		background-color: #24252a;
		padding: 0.5em 1em 0.5em 1em !important;
		border-radius: 0px !important;
		border: 0;
	}
	// :global(.accordion-item:hover) {
	// 	background-color: #2d2f35 !important;
	// }
	// :global(.accordion-item:focus) {
	// 	background-color: #2d2f35 !important;
	// }

	:global(.svelteui-Tooltip-body) {
		padding: 0.75em !important;
		background-color: #363840 !important;
		color: #c1c2c5 !important;
	}

	// Somehow seems to break on build
	:global(.hidden) {
		display: none;
	}

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
	:global(.item-error) {
		box-shadow: 0 0 0 1px #fa5252 inset !important;
	}
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

	// // Repurposing the accordion to a select
	// :global(.svelteui-Accordion-root.accordion-select > div > button > .svelteui-AccordionItem-chevron) {
	// 	display: none;
	// }
	// :global(.svelteui-Accordion-root.accordion-select > div > div > div > div > div) {
	// 	padding: 0 !important;
	// }
	// :global(.svelteui-Accordion-root.accordion-select > div.__svelteui-ref-active > button) {
	// 	background-color: #3f424b !important;
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