<script>
    import Game from "$lib/game/components/Game.svelte";
    import { testGameData } from "$lib/global/functions/testing";

    let gameData = testGameData;
</script>

<Game gameData={gameData} />