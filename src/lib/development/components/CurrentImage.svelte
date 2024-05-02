<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { createEventDispatcher, onMount } from "svelte";
    import { Button, Divider, Flex, NativeSelect, Text, TextInput, Textarea, randomID } from "@svelteuidev/core";
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import { Cross1, Upload } from "radix-icons-svelte";
    import AccordionHeader from "$lib/development/components/AccordionHeader.svelte";
    import SelectComponent from "$lib/development/components/SelectComponent.svelte";
    import { bundleValidStore, gameStore } from "$lib/development/functions/project";
    import { type GameImage, type GameImageArea, gameImageAreaTypeSelectData } from "$lib/global/functions/typings";
    import { isComponentValid } from "$lib/development/functions/validation";

    const dispatch = createEventDispatcher();

    export let imageIndex: number;
    export let imageID: string;
    export let imageData: GameImage;
    $: { imageData; dispatch("change"); }
    let areaAccordionOpenStore: Writable<boolean[]> = writable([]);
    let currentImageAreaIndex: number | undefined = undefined;
    let currentImageAreaIDStore: Writable<string | undefined> = writable(undefined);
    let currentImageAreaData: GameImageArea | undefined = undefined;
    $: { currentImageAreaData; dispatch("change") }
    
    // Handlers for hints within a state
    function createImageArea(): [string, GameImageArea] {
        const hintID = randomID("imageArea");
        return [hintID, { name: "New Location Object", type: "circle", component: "", dialog: "", args: [] }];
    }
    currentImageAreaIDStore.subscribe(_ => {
        currentImageAreaIndex = undefined;
        currentImageAreaData = undefined;

        if($currentImageAreaIDStore === undefined) { return; }
        
        currentImageAreaIndex = imageData.areas.findIndex(fullData => fullData[0] === $currentImageAreaIDStore);
        if(currentImageAreaIndex === undefined) { return; } // Should never happen
        currentImageAreaData = imageData.areas[currentImageAreaIndex][1];
    });

    // Reset arguments whenever location object type changed
    function onImageAreaTypeChange() {
        if(currentImageAreaData === undefined) { return; }
        currentImageAreaData.args = []; 
    }

    // Select image from folder and set base64
    let imageElement: HTMLImageElement;
    let browserFileInput: HTMLInputElement;
    let imageHeight: number | undefined;
    let imageWidth: number | undefined;
    async function selectImage() {
        browserFileInput.click();
    }

    // Since onChange doesn't work, manually check every 50ms for new file
    setInterval(() => {
        if(!browserFileInput) { return; }
        if(browserFileInput?.files?.length === 1) {
            // Load the given file, then clear afterwards
            const file = browserFileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onload = () => {
                // Result contains the dataurl data
                if(reader.result === "") { return; }
                imageData.base64 = reader.result as string;
                imageHeight = 0;
                imageWidth = 0;
            }

            browserFileInput.value = "";
        }
    }, 50);

    function clearImage() {
        imageData.base64 = "";
        imageHeight = 0;
        imageWidth = 0;
    }

    // Update image dimensions when image loads
    function updateImageDimensions() {
        imageHeight = imageElement.offsetHeight;
        imageWidth = imageElement.offsetWidth;
    }

    /* ===============
      Canvas Overlay
    ================*/

    let overlayCanvas: HTMLCanvasElement;
    $: {
        overlayCanvas;
        if(overlayCanvas !== undefined) {
            // Force render on next event loop
            setTimeout(() => {
                renderOverlayCanvas();
            })
        }
    }

    // Clear image area args
    function clearImageArea() {
        if(currentImageAreaData === undefined) { return; }
        currentImageAreaData.args = [];
    }

    // Construct RGB for red and green
    function constructColor(color: "red" | "green", alpha: number) {
        return `rgba(${color === "red"
            ? "255, 0, 0"
            : "0, 255, 0"}, ${alpha})`;
    }

    // Render image objects onto the overlay canvas
    function renderImageArea(imageAreaData: GameImageArea, color: "red" | "green", dotted: boolean = false) {
        // Retrieve context and setup basic data beforehand
        const context = overlayCanvas.getContext("2d");
        if(context === null) { return; }
        const boundingRect = overlayCanvas.getBoundingClientRect();
        context.strokeStyle = constructColor(color, 1);

        // const path = new Path2D();
        // path.arc(100, 100, 10, 0, 2 * Math.PI);
        // context.stroke(path);

        // Draw depending on whether type is polygon 
        if(imageAreaData.type === "polygon") {
            // Iterate over points and draw lines between them before filling
            // First draw dots at every point
            for(let index = 0; index < imageAreaData.args.length; index += 2) {
                // Goes like [x1, y1, x2, y2, etc.]
                const ratioX = imageAreaData.args[index];
                const ratioY = imageAreaData.args[index + 1];
                const coordX = Math.floor(ratioX * boundingRect.width);
                const coordY = Math.floor(ratioY * boundingRect.height);

                // Draw the path
                const path = new Path2D();
                path.arc(coordX, coordY, 2, 0, 2 * Math.PI);
                if(index === 0 && color === "green") { 
                    // Add an additional circle for the "finishing" point when selected
                    path.arc(coordX, coordY, 4, 0, 2 * Math.PI);
                }

                context.stroke(path);
            }

            // Draw lines starting from the starting point, all the way back
            const path = new Path2D();
            const expandedArgs = [...imageAreaData.args];
            if(imageAreaData.args.length > 0) {
                // Expand to draw a line back to the start
                expandedArgs.push(imageAreaData.args[0]);
                expandedArgs.push(imageAreaData.args[1]);
            }
            for(let index = 0; index < expandedArgs.length; index += 2) {
                // Goes like [x1, y1, x2, y2, etc.]
                const ratioX = expandedArgs[index];
                const ratioY = expandedArgs[index + 1];
                const coordX = Math.floor(ratioX * boundingRect.width);
                const coordY = Math.floor(ratioY * boundingRect.height);

                // Move to initial point or draw line
                if(index === 0) {
                    path.moveTo(coordX, coordY);
                } else {
                    path.lineTo(coordX, coordY);
                }
            }

            // Reference to drawing the polygon path
            context.fillStyle = constructColor(color, 0.2);
            context.lineWidth = 2;
            if(dotted === true) { context.setLineDash([5, 15]) }
            context.stroke(path);
            context.fill(path);
            context.setLineDash([]);
        } else { // if(imageAreaData.type === "circle")
            // Center point should always be defined, radius not really
            let [centerRatioX, centerRatioY, radiusRatioX, radiusRatioY] = imageAreaData.args;
            
            function strokeCircle(currentPath: Path2D) {
                // Not sure why this is necessary
                if(context === null) { return; }

                // Reference to drawing the circle path
                context.fillStyle = constructColor(color, 0.2);
                context.lineWidth = 2;
                if(dotted === true) { context.setLineDash([5, 15]) }
                context.stroke(currentPath);
                context.fill(currentPath);
                context.setLineDash([]);
            }

            const centerCoordX = Math.floor(centerRatioX * boundingRect.width);
            const centerCoordY = Math.floor(centerRatioY * boundingRect.height);
            if(radiusRatioX === undefined || radiusRatioY === undefined) {
                // Radius not defined, only draw middle dot
                const path = new Path2D();
                path.arc(centerCoordX, centerCoordY, 2, 0, 2 * Math.PI);
                strokeCircle(path);
            } else {
                // Radius defined, draw entire circle with smaller middle dot
                const innerPath = new Path2D();
                innerPath.arc(centerCoordX, centerCoordY, 2, 0, 2 * Math.PI);
                strokeCircle(innerPath);

                const outerPath = new Path2D();
                // Then draw the larger circle outside
                const radiusCoordX = Math.floor(radiusRatioX * boundingRect.width);
                const radiusCoordY = Math.floor(radiusRatioY * boundingRect.height);
                const radius = Math.sqrt(Math.pow(centerCoordX - radiusCoordX, 2) + Math.pow(centerCoordY - radiusCoordY, 2));
                outerPath.arc(centerCoordX, centerCoordY, radius, 0, 2 * Math.PI);
                strokeCircle(outerPath);
            }
        }
    }

    // Small wrapper for rendering individual areas
    function renderImageAreaWrapper(imageAreaData: GameImageArea, color: "red" | "green") {
        // Skip if there's nothing to render
        if(imageAreaData.args.length === 0) { return; }

        renderImageArea(imageAreaData, color, false);
        if(color === "green") {
            // Dotted line around currently selected
            renderImageArea(imageAreaData, color, true);
        }
    }

    // Fancy handling for overlay rendering
    // Renders a dumb number of times, can't do anything about it
    function renderOverlayCanvas(event?: MouseEvent) {
        // Obviously can't render nothing
        if(!overlayCanvas || imageElement === undefined || imageData.base64 === "") { return; }

        // Clear canvas before re-rendering 
        const context = overlayCanvas.getContext("2d");
        if(context === null) { return; }
        context.closePath();
        context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        // Only handle onclick if minimap object is selected and points are addable
        if(event !== undefined && currentImageAreaData !== undefined) {
            // Only add if currently addable: length of circle less than 4
            if(currentImageAreaData.type === "polygon" || currentImageAreaData.args.length < 4) {
                // Get position of mouse cursor as click, maintain as ratio
                const boundingRect = overlayCanvas.getBoundingClientRect();
                const ratioX = Math.max(Math.floor(event.clientX - boundingRect.left), 0) / boundingRect.width;
                const ratioY = Math.max(Math.floor(event.clientY - boundingRect.top), 0) / boundingRect.height;
                currentImageAreaData.args.push(ratioX, ratioY);
                dispatch("change"); // Force a re-render
            }
        }

        // Render non-selected objects first underneath
        for(const [imageAreaID, imageAreaData] of imageData.areas) {
            // Skip if current area is the one selected, do later
            if($currentImageAreaIDStore !== imageAreaID) {
                renderImageAreaWrapper(imageAreaData, "red");
            }
        }

        // Force iterate because sometimes current data doesn't rest properly
        for(const [imageAreaID, imageAreaData] of imageData.areas) {
            if($currentImageAreaIDStore === imageAreaID) {
                renderImageAreaWrapper(imageAreaData, "green");
            }
        }
    }
    onMount(() => { renderOverlayCanvas(); })

    $: {
        // Re-draw when area or image changes
        imageData;
        currentImageAreaData;
        setTimeout(() => {
            renderOverlayCanvas();
        })
    }
</script>

<!-- Somehow flex doesn't have items???-->
<Flex class="h-full" direction="column" gap="xs">
    <Flex class="grow w-full" gap="md">
        <Flex class="w-[40%]" direction="column">
            <!-- Dummy hidden input element -->
            <input class="hidden" 
                type="file" 
                accept="image/*" 
                name="game_data_full" 
                size=1
                bind:this={browserFileInput}>
            <TextInput label="Title" 
                placeholder="[Minimap] Basement"
                required={true} 
                error={imageData.title.length == 0} 
                bind:value={imageData.title} />
            <Flex class="w-full mt-[0.625em]" 
                justify="space-around" gap="md">
                <Button color="gray"
                    on:click={selectImage}>
                    <Upload slot="leftIcon" />
                    Select Image
                </Button>
                <Button color="gray"
                    on:click={clearImage}>
                    <Cross1 slot="leftIcon" />
                    Clear Image
                </Button>
            </Flex>
            <Divider orientation="horizontal" />
            <AccordionHeader label="Objects"
                accordionOpenStore={areaAccordionOpenStore}
                currentIDStore={currentImageAreaIDStore}
                orderedData={imageData.areas}
                callback={() => { imageData = imageData; }}
                callbackCreate={createImageArea} />
            <Accordion class="accordion accordion-select grow mt-[0.625em]">
                {#each imageData.areas as [imageAreaID, imageAreaData], index}
                    <!-- Bundle has issues after deletion, race condition -->
                    {#if $bundleValidStore["images"]["areas"][imageIndex]}
                        <AccordionItem class={$bundleValidStore["images"]["areas"][imageIndex][index] 
                                ? "item-valid" : "item-error"}
                            transitionType="slide" transitionParams={{ duration: 200 }}
                            bind:open={$areaAccordionOpenStore[index]}>
                            <Flex slot="header" 
                                direction="row" 
                                justify="space-between">
                                <Text class="min-h-[1.5em]" size="md">
                                    {#key $bundleValidStore}
                                        {imageAreaData.name}
                                    {/key}
                                </Text>
                                <Text class="min-h-[1.5em] mr-[0.5em]" size="md"
                                    weight="semibold">
                                    {#key $bundleValidStore}
                                        {imageAreaData.type[0].toUpperCase()}
                                    {/key}
                                </Text>
                            </Flex>
                        </AccordionItem>
                    {/if}
                {/each}
            </Accordion>
        </Flex>
        <Divider orientation="vertical" />
        <Flex class="w-[60%]" direction="column">
            <Flex class="w-full grow flex align-center justify-center p-[1em]">
                <div class="relative w-full h-full">
                    {#if imageData.base64 !== ""}
                        <Flex class="absolute inset-0 align-center justify-center">
                            {#key imageID}
                                <img class="object-contain" 
                                    src={imageData.base64}
                                    on:load={() => { updateImageDimensions(); renderOverlayCanvas(); }}
                                    bind:this={imageElement} />
                            {/key}
                        </Flex>
                    {/if}
                    <Flex class="absolute inset-0 align-center justify-center z-100">
                        {#if imageElement && imageHeight}
                            <canvas height={imageHeight}
                                width={imageWidth}
                                bind:this={overlayCanvas}
                                on:click={renderOverlayCanvas} />
                        {/if}
                    </Flex>
                </div>
            </Flex>
            <Divider orientation="horizontal" />
            <Flex class="h-[17.59375em]" 
                direction="column" gap="xs">
                {#if currentImageAreaIndex !== undefined && $currentImageAreaIDStore !== undefined
                    && currentImageAreaData !== undefined}
                    <Flex align="center" gap="md">
                        <TextInput class="grow-[16]"
                            label="Name" 
                            placeholder="Handcuffs Key"
                            required={true} 
                            error={currentImageAreaData.name.length == 0} 
                            bind:value={currentImageAreaData.name} />
                        <div class="grow" />
                        <Button color="gray"
                            on:click={clearImageArea}>
                            <Cross1 slot="leftIcon" />
                            Clear Area
                        </Button>
                        <div class="grow" />
                    </Flex>
                    <Flex gap="md">
                        <SelectComponent class="grow"
                            label="Component"
                            bind:selectedComponentID={currentImageAreaData.component}
                            error={currentImageAreaData.dialog === "" && !isComponentValid(currentImageAreaData.component, $gameStore)}
                            excludeBodyParts={true}
                            excludeRestraints={true} />
                        <NativeSelect class="w-[10em]"
                            label="Type"
                            data={gameImageAreaTypeSelectData}
                            on:change={() => { onImageAreaTypeChange() }}
                            bind:value={currentImageAreaData.type} />
                    </Flex>
                    <Textarea label="Dialog Text"
                        placeholder={`(Empty: use component dialog text)\nThe key to your handcuffs gleaming underneath the dim lighting... tantalizingly out of reach.`}
                        rows={3} required={false} 
                        bind:value={currentImageAreaData.dialog} />
                {/if}
            </Flex>
        </Flex>
    </Flex>
</Flex>