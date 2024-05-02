<script lang="ts">
    import { Flex } from "@svelteuidev/core";
    import { lookupStore, progressStore } from "$lib/game/functions/progress";
    import type { GameImage } from "$lib/global/functions/typings";
    import { onMount } from "svelte";

    let _class: string = ""; export { _class as class };
    export let imageData: GameImage;

    // Update image width and height when image loads
    let imageElement: HTMLImageElement;
    let imageWidth: number; let imageHeight: number;
    const observer = new ResizeObserver(entries => {
        if(!imageElement) { return }
        imageHeight = imageElement.offsetHeight;
        imageWidth = imageElement.offsetWidth;
    })
    onMount(() => {
        observer.observe(imageElement);
    })

    // Handle click from overlay canvas
    let overlayCanvas: HTMLCanvasElement;
    function handleCanvasClick(event: MouseEvent) {
        // Obviously can't handle if there's nothing
        if(!overlayCanvas || imageElement === undefined) { return; }

        // Determine the coordinates clicked
        const context = overlayCanvas.getContext("2d");
        if(!context) { return; }
        const boundingRect = overlayCanvas.getBoundingClientRect();
        const clickCoordX = event.clientX - boundingRect.left;
        const clickCoordY = event.clientY - boundingRect.top;

        // Iterate over image objects, drawing paths and checking inclusions
        for(const [_, areaData] of imageData.areas) {
            const path = new Path2D();
            if(areaData.type === "polygon") {
                // Last path to back to initial point required?
                for(let index = 0; index < areaData.args.length - 1; index += 2) {
                    const coordX = Math.floor(areaData.args[index] * boundingRect.width);
                    const coordY = Math.floor(areaData.args[index + 1] * boundingRect.height);
                    path.lineTo(coordX, coordY)
                }
            } else { // circle
                const [centerRatioX, centerRatioY, radiusRatioX, radiusRatioY] = areaData.args;
                const centerCoordX = Math.floor(centerRatioX * boundingRect.width);
                const centerCoordY = Math.floor(centerRatioY * boundingRect.height);
                const radiusCoordX = Math.floor(radiusRatioX * boundingRect.width);
                const radiusCoordY = Math.floor(radiusRatioY * boundingRect.height);
                const radius = Math.sqrt(Math.pow(centerCoordX - radiusCoordX, 2) + Math.pow(centerCoordY - radiusCoordY, 2));
                path.arc(centerCoordX, centerCoordY, radius, 0, 2 * Math.PI);
            }

            // Check whether cursor click is inside the path
            if(context.isPointInPath(path, clickCoordX, clickCoordY)) {
                // Handle click - aka add object if not already defined, and show dialog
                let dialogText = areaData.dialog;
                if(areaData.component !== "") {
                    if($progressStore.objects.includes(areaData.component) === false) {
                        $progressStore.objects.push(areaData.component);
                    }
                    const componentData = $lookupStore.objects[areaData.component];
                    if(areaData.dialog === "") { dialogText = componentData.examine; }
                }
                $progressStore.dialog[0] = "";
                $progressStore.dialog[1] = dialogText;

                break;
            }
        }
    }
</script>

<Flex class={`relative ${_class}`}>
    <Flex class="absolute inset-0" align="center" justify="center">
        <img class="max-w-full max-h-full object-contain"
            usemap="#minimap"
            src={imageData.base64}
            bind:this={imageElement} />
    </Flex>
    <Flex class="absolute inset-0 items-center align-center z-100" 
        justify="center" direction="column">
        {#if imageElement && imageHeight}
            <canvas height={imageHeight}
                width={imageWidth}
                bind:this={overlayCanvas}
                on:click={handleCanvasClick} />
        {/if}
    </Flex>
</Flex>