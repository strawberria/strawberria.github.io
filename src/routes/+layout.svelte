<script lang="ts">
    import { SvelteUIProvider } from "@svelteuidev/core";
	import "../app.css";
</script>

<SvelteUIProvider class="w-full"
	withGlobalStyles themeObserver={'dark'}>
	<slot />
</SvelteUIProvider>

<style lang="scss">
	:global(.text-highlight:hover) {
        cursor: pointer !important;
        text-shadow: #ffffff 1px 1px 10px !important;
    }
	:global(.center > *) {
        text-align: center !important;
    }
	:global(.svelteui-TypographyProvider-root > *) {
		margin-bottom: 8px !important;
		margin-top: 0px !important;
	}
	:global(.svelteui-Switch-input) {
		overflow: inherit !important;
	}
	:global(.noring > span:focus) {
		box-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
	}
	:global(.svelteui-Tabs-tabs[aria-orientation="vertical"]) {
		height: 100% !important;
	}
	:global(.accordion) {
		overflow-y: auto;
	}
	:global(.accordion > h2 > button) {
		background-color: #24252a !important;
		padding: 0.5em 1em 0.5em 1em !important;
		border-radius: 0px !important;
		color: #c1c2c5 !important;
		min-height: 2.625em;
	}
	:global(.accordion > h2 > button > div) {
		width: 100% !important;
	}
	:global(.accordion > h2 > button:not(.item-error)) {
		box-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
	}
	:global(.accordion > div > div) {
		border-left: 0 !important;
		border-right: 0 !important;
		padding: 1em !important;
	}
	:global(.accordion.accordion-select > div) {
		display: none !important;
	}
	:global(.accordion.accordion-select > h2 > button > svg) {
		display: none !important;
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
		display: none !important;
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

	// :global(.svelteui-AccordionItem-root > button) {
	// 	padding-left: 1em !important;
	// 	padding-right: 0.5em !important;
	// 	background-color: #24252a !important;
	// }
	// :global(.svelteui-AccordionItem-root > button:hover) {
	// 	background-color: #2d2f35 !important;
	// }
	// :global(.svelteui-AccordionItem-root > button > span.svelteui-AccordionItem-chevron) {
	// 	margin-left: 0.25em !important;
	// }

	// :global(.svelteui-AccordionItem-root > button > .svelteui-AccordionItem-controlContent) {
	// 	padding-top: 0.5em !important;
	// 	padding-bottom: 0.5em !important;
	// }

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
		color: #c1c2c5 !important;
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