import { get } from "svelte/store";
import type { GameInteraction, GameState } from "$lib/global/functions/typings";
import { gameStore } from "$lib/development/functions/project";
import { getInteractionNode } from "$lib/development/functions/validation";

// Escape string for graphviz usage
// https://forum.graphviz.org/t/how-do-i-properly-escape-arbitrary-text-for-use-in-labels/1762/8
function escapeString(str: string) {
    return str.replaceAll(`\\`, `\\\\`)
        .replaceAll(`"`, `\\"`) 
        .replaceAll(`\n`, `\\n`)
        .replaceAll(`\r`, `\\r`)
        .replaceAll(`\t`, `\\t`)
        .replaceAll(`\b`, `\\b`)
        .replaceAll(`\f`, `\\f`);
}

// Generate graphviz for all states within game
export function generateStatesGraphviz() {
    const gameData = get(gameStore);

    // Graph constants, spline=false for now - add close curly at end
    let graphLines = [
        `digraph {`,
        `  center=true`,
        `  bgcolor="#1a1b1e"`,
        `  node [color="#c1c2c5", fillcolor="#c1c2c5", fontcolor="#c1c2c5"]`,
        `  edge [color="#c1c2c5", fontcolor="#c1c2c5"]`,
        ``
    ];

    // Define individual nodes first by index including text, etc.
    const stateMappings: { [key: string]: GameState } = {};
    for(const [stateID, stateData] of gameData.data.states) {
        const peripheries = stateData.type === "opening" || stateData.type === "ending" ? 2 : 1;
        const shape = stateData.type === "opening" ||  stateData.type === "ending"
            ? "box" : stateData.type === "normal" 
            ? "oval" : "hexagon"; // Choice
        graphLines.push(`  "${stateID}" [label="${escapeString(stateData.title)}", peripheries=${peripheries}, shape=${shape}]`);
        stateMappings[stateID] = stateData;
    }
    graphLines.push("");

    // Iterate through non-normal states and map next states
    for(const [stateID, stateData] of gameData.data.states) {
        if(stateData.type === "normal") { continue; }
        if(stateData.type === "choice") {
            // Label edges with choice name (long?)
            for(const [_, choiceData] of stateData.choices) {
                if(stateMappings[choiceData.state] !== undefined) {
                    graphLines.push(`  "${stateID}" -> "${choiceData.state}" [label="${escapeString(choiceData.text)}"]`);
                }
            }
        } else if(stateData.type !== "ending") {
            // Opening or transition, label edges normally
            if(stateMappings[stateData.nextState] !== undefined) { 
                graphLines.push(`  "${stateID}" -> "${stateData.nextState}"`);
            }
        }
    }
    graphLines.push("");

    // Iterate through interactions for states and find state transitions
    for(const [_, interactionData] of gameData.data.interactions) {
        // Filter out invalid active states
        const activeStates = interactionData.states.filter(stateID => stateMappings[stateID] !== undefined);
        for(const [_, nodeData] of interactionData.nodes) {
            // Skip any non-execution nodes which can set next state
            if(nodeData.type !== "execute") { continue; }
            for(const [resultID, resultData] of nodeData.results) {
                // If any results are change state, add those
                if(resultData.type === "stateSet" && stateMappings[resultData.args[0]] !== undefined) {
                    // Iterate over active states and add those edges
                    for(const activeStateID of activeStates) {
                        // Should interaction or node name be used?
                        graphLines.push(`  "${activeStateID}" -> "${resultData.args[0]}" [label="${escapeString(interactionData.title)}"]`);
                    }
                }
            }
        }
    }
    graphLines.push("}");

    return graphLines.join("\n");
}

// Generate graphviz for given interaction
export function generateInteractionGraphviz(interactionData: GameInteraction) {
    // Graph constants, spline=false for now - add close curly at end
    let graphLines = [
        `digraph {`,
        `  center=true`,
        `  bgcolor="#1a1b1e"`,
        `  node [color="#c1c2c5", fillcolor="#c1c2c5", fontcolor="#c1c2c5"]`,
        `  edge [color="#c1c2c5", fontcolor="#c1c2c5"]`,
        ``
    ];
    
    // Define individual nodes first by index including text, etc.
    for(const [nodeID, nodeData] of interactionData.nodes) {
        const peripheries = nodeData.start || nodeData.end ? 2 : 1;
        const shape = nodeData.type.startsWith("criteria") ? "hexagon" : "oval"
        graphLines.push(`  "${nodeID}" [label="${escapeString(nodeData.title)}", peripheries=${peripheries}, shape=${shape}]`);
    }
    graphLines.push("");

    // Define edge connections, add label True/False for criteria
    for(const [nodeID, nodeData] of interactionData.nodes) {
        const nextPassNode = getInteractionNode(nodeData.nextPass, interactionData);
        const nextFailNode = getInteractionNode(nodeData.nextFail, interactionData);
        const isCriteria = nodeData.type.startsWith("criteria");
        if(nextPassNode !== undefined && nodeData.end === false) {
            // Draw edge to pass node, label "True" for criteria
            graphLines.push(`  "${nodeID}" -> "${nodeData.nextPass}" ${isCriteria ? "[label=True]" : ""}`);
        }
        if(isCriteria === true && nextFailNode !== undefined) {
            // Draw edge to fail node with "Fail" label
            graphLines.push(`  "${nodeID}" -> "${nodeData.nextFail}" [label=False]`);
        }
    }
    graphLines.push("}");

    return graphLines.join("\n");
}