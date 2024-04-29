import type { GameAction, GameBodyPart, GameImage, GameInteraction, GameInteractionNodeFlagMap, GameInteractionNode, GameInteractionNodeCriteria, GameInteractionNodeResult, GameLocation, GameObject, GameRestraint, GameState, GameStateChoice, GameStateHint, GameTag, GameImageArea } from "$lib/global/functions/typings";

// Represents current progress within the game
export interface ProgressData {
    dialog:     [string, string];
    actionText: string; // Current action text, ex: "Cut Rope with Knife"
    state:      string; 
    objects:    string[];
    restraints: { [bodyPartID: string]: string };
    location:   string;
    locations:  string[]; // All available
    flags:      { [flagKey: string]: string };
    attempts:   number;   // For hints, trigger when equals
    needReveal: string[]; // Only for initial objects / restraints
}

// Lookup data for game for easy reference
export interface LookupData {
    // Base lookup for top-level game data
    actions:      { [id: string]: GameAction };
    bodyParts:    { [id: string]: GameBodyPart };
    states:       { [id: string]: GameState };
    interactions: { [id: string]: GameInteraction };
    restraints:   { [id: string]: GameRestraint };
    objects:      { [id: string]: GameObject };
    images:       { [id: string]: GameImage };
    locations:    { [id: string]: GameLocation };
    // Second-level game data
    hints:         { [stateID: string]: { [hintID: string]: GameStateHint} };
    choices:       { [stateID: string]: { [choiceID: string]: GameStateChoice} };
    nodes:         { [interactionID: string]: { [nodeID: string]: GameInteractionNode } };
    areas:         { [imageID: string]: { [areaID: string]: GameImageArea } };
    tags:          { [componentID: string]: { [tagID: string]: GameTag } };
    // Third-level game data
    criteria:      { [interactionID: string]: { [nodeID: string]: { [criteriaID: string]: GameInteractionNodeCriteria } } };
    results:       { [interactionID: string]: { [nodeID: string]: { [resultID: string]: GameInteractionNodeResult } } };
    flagMap:       { [interactionID: string]: { [nodeID: string]: { [flagMapID: string]: GameInteractionNodeFlagMap } } };
    // Miscellaneous data
    maxHints: number;
}

// Current click data
export type CurrentData = [string | undefined, [string | undefined, string | undefined]];

// Current restraints display
export interface BodyPartRestraints { 
    bodyPart: GameBodyPart; 
    restraint: GameRestraint | undefined;
    restraintID: string | undefined;
}