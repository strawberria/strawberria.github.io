export async function get({ params }: { params: { game: string }}) {
    // Check whether the game file with the given name exists
    const requestedPath = `../../../games/${params.game}.json`;
    const storageGames = import.meta.glob('../../../games/*.json', { as: "raw" });
    const gameData = storageGames[requestedPath];
    
    return {
        status: gameData !== undefined ? 200 : 404,
        headers: { "Content-type" : "application/json" },
        body: {
            rawGameData: gameData ?? JSON.stringify({ "error": "Game with the requested filename could not be found" })
        }
    };
}