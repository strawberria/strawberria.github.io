import type { CompatibilityData, GameData, GameSaveData } from "$lib/global/functions/typings";

// Default game data for initialization and reset
export const currentVersion = "0.3.2";
export const defaultGameData: GameData = {
    metadata: {
        title: "",
        developer: "",
        version: "",
        description: "",
        changelogs: [],
    },
    data: {
        actions: [],
        bodyParts: [],
        states: [],
        interactions: [],
        objects: [],
        restraints: [],
        images: [],
        locations: [],
    },
};

export const allCompatibilityData: CompatibilityData[] = [
    {
        // No update necessary from 0.1.0
        "versions": ["0.1.0", "0.1.1", "0.2.0"],
        "finalVersion": "0.2.0",
        "updateFunc": (gameData: GameData): GameData => {
            // Add display name for all locations
            for(const [_, locationData] of gameData.data.locations) {
                if(locationData.display === undefined) {
                    locationData.display = "";
                }
            }

            // Remove titles from node criteria and results
            for(const [_, interactionData] of gameData.data.interactions) {
                for(const [_, nodeData] of interactionData.nodes) {
                    for(const [_, criteriaData] of nodeData.criteria) {
                        delete (criteriaData as any).title;
                    }
                    for(const [_, resultData] of nodeData.results) {
                        delete (resultData as any).title;
                    }
                }
            }

            return gameData;
        }
    },
    {
        "versions": ["0.2.0", "0.2.1"],
        "finalVersion": "0.2.1",
        "updateFunc": (gameData: GameData): GameData => {
            // Replace all references to "badEnd" state type with "bad_end"
            for(const [_, stateData] of gameData.data.states) {
                if((stateData.type as string) === "badEnd") {
                    stateData.type = "bad_end";
                }
            }

            // Delete "state" from flag map, replace with "node"
            for(const [_, interactionData] of gameData.data.interactions) {
                for(const [_, nodeData] of interactionData.nodes) {
                    for(const [_, flagMapData] of nodeData.flagMap) {
                        delete (flagMapData as any).state;
                        if(flagMapData.node === undefined) {
                            flagMapData.node = "";
                        }
                    }
                }
            }

            return gameData;
        }
    },
    {
        "versions": ["0.2.1", "0.3.0", "0.3.1", "0.3.2"],
        "finalVersion": "0.3.2",
        "updateFunc": (gameData: GameData): GameData => {
            // Convert all names for body parts to display
            for(const [_, bodyPartData] of gameData.data.bodyParts) {
                if(bodyPartData.display === undefined && (bodyPartData as any).name !== undefined) {
                    bodyPartData.display = (bodyPartData as any).name;
                    delete (bodyPartData as any).name
                }
            }
            // By default, duplicate all object and restraints name to display (if not defined)
            for(const [_, objectData] of gameData.data.objects) {
                if(objectData.display === undefined) {
                    objectData.display = objectData.name;
                }
            }
            for(const [_, restraintData] of gameData.data.restraints) {
                if(restraintData.display === undefined) {
                    restraintData.display = restraintData.name;
                }
            }

            return gameData;
        }
    }
]

// Handle backwards compatibility from previous versions
export function updateGameCompatibility(fullGameData: any): GameSaveData {
    // Iterate over compatibility patches and process
    for(const compatibilityData of allCompatibilityData) {
        if(compatibilityData.versions.includes(fullGameData["version"])) {
            // Update the game data and version
            fullGameData = {
                version: compatibilityData.finalVersion,
                game: compatibilityData.updateFunc(fullGameData["game"])
            }
        }
    }

    return fullGameData;
}