import type { PreviewGameData, ProjectData } from "src/types";

export async function get({ params }: { params: { game: string }}) {
    // Retrieve generic data for all games, returning them to the client
    const storageGames = import.meta.glob('../../../games/*.json');
    const previewList: PreviewGameData[] = (await Promise.all(Object.entries(storageGames)
        .map(async ([relativePath, gameFunc]): Promise<PreviewGameData | undefined> => {
            // In case JSON format of one or more games are broken
            try { 
                // Retrieve the actual game data from the filesystem
                const gameRef = relativePath.split("/").pop()?.split(".json")[0] as string;
                const gameData: ProjectData = (await gameFunc()).default;

                // Retrieve the last updated timestamp from GitHub
		        const updateResponse = await fetch(`https://api.github.com/repos/strawberria/did-engine-pages/commits?path=games/${gameRef}.json&page=1&per_page=1`);
                const updateJSON: any[] = await updateResponse.json();
                if(updateJSON.length === 0) { return undefined; } // File not found on GitHub
                const commitTimestamp = new Date(updateJSON[0].commit.author.date).getTime();

                return {
                    ref: gameRef,
                    updated: commitTimestamp,
                    information: gameData.data.information,
                };
            } catch(err) { console.log(err) }
        }))).filter(g => g !== undefined) as PreviewGameData[];

    // Sort by update time (TODO sort by update time?)
    previewList.sort((a, b) => a.updated - b.updated);
    
    return {
        status: 200,
        headers: { "Content-type" : "application/json" },
        body: previewList,
    };
}