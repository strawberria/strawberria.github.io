<script lang="ts">
    import { Button, Divider, Flex, Text } from "@svelteuidev/core";
    import { currentVersion } from "$lib/global/functions/project";
</script>

<svelte:head>
	<title>Mitts Engine</title>
</svelte:head>
<Flex class="absolute inset-0 p-[1em]" direction="column" align="center">
    <Flex direction="column" align="center">
        <Flex gap="xs">
            <Text class="!text-3xl" weight="semibold">Mitts-Engine v{currentVersion}</Text>
            <Text class="!text-3xl" weight="semibold" color="$blue400">│</Text>
            <Text class="!text-3xl" weight="semibold">Developed by @strawberria</Text>
        </Flex>
        <Divider class="w-full" orientation="horizontal" />
        <Flex class="w-full h-full" align="center" justify="center" gap="lg">
            <div class="grow" />
            <Flex class="h-full w-[22em]" direction="column" gap="xs" align="center">
                <!-- <Text>Join the Discord community for development discussion and game releases!</Text> -->
                <Button class="!p-[1em] !w-full !center-text !text-lg !rounded-xl"
                    on:click={() => { window.open("https://github.com/strawberria/strawberria.github.io") }}>
                    Check out the GitHub repo!
                </Button>
                <Button class="!p-[1em] !w-full !center-text !text-lg !rounded-xl"
                    on:click={() => { window.open("/mitts/development") }}>
                    Access the development kit!
                </Button>
                <iframe class="h-[20em] w-full" src="https://discord.com/widget?id=1234616279843995718&theme=dark" width="350" height="500" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
            </Flex>
            <Divider orientation="vertical" />
            <Flex class="w-full max-w-[64em] h-full" direction="column"
                align="center">
                <Text   weight="semibold">
                    Browser-based game engine for creating point-and-click "damsel-in-distress"-style escape games,
                    inspired by games from creators like <a href="https://aelie.altervista.org/" target="_blank">Aelie</a>
                    and <a href="http://tripleq.web.fc2.com/" target="_blank">TripleQ</a> - and now more accessible than ever
                    with a browser-based development kit, massively simplifying the development process!
                </Text>
                <ul class="w-full list-disc list-outside ml-[3em] space-y-[0.125em]">
                    <li>
                        Create and reference individual components with ease - including actions, body parts, restraints, objects, locations, and more!
                    </li>
                    <li>
                        Manage overall progress through flag-mapping, numerous state choices (including choice states), and multiple locations!
                    </li>
                    <li>
                        Effortlessly create complex interactions and dynamic gameplay through node-based interactions:
                    </li>
                    <li class="ml-[1.5em]">
                        Supporting filtering within multiple component-component combinations (filtered within criteria nodes) and matching states!
                    </li>
                    <li class="ml-[1.5em]">
                        Implementing numerous AND/OR-matched criteria including: flag matching, component tags, current objects and restraints, and more!
                    </li>
                    <li class="ml-[1.5em]">
                        Implementing numerous execution results including: flag setting, location updating, adding and removing objects and restraints, and more!
                    </li>
                    <li>
                        Easily design circular or polygonal click areas for minimaps (and now images!) using a convenient click-based overlay!
                    </li>
                    <li>
                        Conveniently view your entire game (states) and individual interactions through <a href="https://graphviz.org/" target="_blank">graphviz</a> displays!
                    </li>
                </ul>
                <Divider class="w-full mt-[1.25em]" orientation="horizontal" />
                <Flex class="w-full" gap="lg" direction="column">
                    <Text class="!w-full !center-text !py-[0.125em] !bg-[#3f424b] !text-xl" weight="semibold">Current Games</Text>
                    <Text class="!w-full !center-text">[ Work in Progress ]</Text>
                </Flex>
            </Flex>
        </Flex>
    </Flex>
</Flex>

<style>
    a {
        color: #4dabf7;
        text-decoration: underline;
    }
</style>