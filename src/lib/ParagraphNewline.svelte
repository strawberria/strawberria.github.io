<script lang="ts">
    let customClass: string = "";
    export { customClass as class }
    
    export let text: string;
    let splitText: string[];
    $: {
        text;
        splitText = text.split("\n");
    }
</script>

{#each splitText as individualText}
    <p class={customClass}>{individualText}</p>
{/each}