export interface Settings { 
    autosave: -1 | 60 | 300 | 600;
}

export interface CompatibilityData {
    versions:     string[];
    finalVersion: string;
    updateFunc:   (data: any) => any;
}

// Includes mapping to data and ordering
export type OrderedData<T> = [string, T][];
export interface GameData {
    metadata: {
        title:       string;
        developer:   string;
        version:     string;
        description: string;
        changelogs:  OrderedData<GameChangelog>;
    };
    data: {
        actions:      OrderedData<GameAction>;
        bodyParts:    OrderedData<GameBodyPart>;
        states:       OrderedData<GameState>;
        interactions: OrderedData<GameInteraction>;
        restraints:   OrderedData<GameRestraint>;
        objects:      OrderedData<GameObject>;
        images:       OrderedData<GameImage>;
        locations:    OrderedData<GameLocation>;
    };
}
export interface GameSaveData {
    version: string;
    game:    GameData;
}

export interface GameAction {
    name:  string;
    junct: string;
    two:   boolean;
    order: boolean;
}

export interface GameBodyPart {
    display:  string;
    initial:  string;
    hidden:   boolean;
}

export interface GameChangelog {
    version: string;
    note:    string;
    text:    string;
}

export type GameStateType = "opening" | "normal" | "choice" | "transition" | "ending" | "bad_end";
export let stateTypeSelectData = [
    { label: "Opening", value: "opening"},
    { label: "Normal", value: "normal"},
    { label: "Choice", value: "choice"},
    { label: "Transition", value: "transition"}, // TODO add transition text
    { label: "Ending", value: "ending"},
    { label: "Bad End", value: "bad_end"},
];
export interface GameStateHint {
    title:    string;
    text:     string;
    attempts: number;
}
export interface GameStateChoice {
    text:    string;
    state:   string;
    flagKey: string;
    flagVal: string;
}
export interface GameState {
    title:       string;
    type:        GameStateType;
    image:       string;
    description: string;
    notes:       string;
    nextState:   string;                       // Empty for ending
    hints:       OrderedData<GameStateHint>;
    choices:     OrderedData<GameStateChoice>; // Only for choice state
}

export interface GameInteraction {
    title:  string;
    action: string;
    args:   [string[], string[]];
    notes:  string;
    states: string[];
    nodes:  OrderedData<GameInteractionNode>;
}

export type GameInteractionNodeCriteriaType = "flagEquals" | "flagNotEquals" | "currentState" 
    | "restraintWearing" | "restraintNotWearing" | "restraintWearingTag" | "restraintNotWearingTag"
    | "objectFound" | "objectNotFound" | "objectFoundTag" | "objectNotFoundTag" 
    | "component1Tag" | "component2Tag" | "failedAttempts";
export let interactionNodeCriteriaTypeSelectData: { label: string; value: GameInteractionNodeCriteriaType }[] = [
    { label: "Flag Equals", value: "flagEquals"},
    { label: "Flag Not Equals", value: "flagNotEquals"},
    { label: "Current State", value: "currentState" },
    { label: "Wearing Restraint", value: "restraintWearing"},
    { label: "Not Wearing Restraint", value: "restraintNotWearing"},
    { label: "Wearing Restraint (Tag)", value: "restraintWearingTag"},
    { label: "Not Wearing Restraint (Tag)", value: "restraintNotWearingTag"},
    { label: "Object Found", value: "objectFound"},
    { label: "Object Not Found", value: "objectNotFound"},
    { label: "Object Found (Tag)", value: "objectFoundTag"},
    { label: "Object Not Found (Tag)", value: "objectNotFoundTag"},
    { label: "Component 1 (Tag)", value: "component1Tag"}, // Order matters?
    { label: "Component 2 (Tag)", value: "component2Tag"}, // Order matters?
    { label: "Failed Attempts", value: "failedAttempts"},
];
export interface GameInteractionNodeCriteria {
    type:  GameInteractionNodeCriteriaType;
    args:  [string, string];
}

export type GameInteractionNodeResultType = "restraintAdd" | "restraintRemove" | "objectAdd"
    | "objectRemove" | "locationAdd" | "locationRemove" | "locationUpdate" | "stateSet"
    | "flagSet" | "dialogShow";
export let interactionNodeResultTypeSelectData: { label: string; value: GameInteractionNodeResultType }[] = [
    { label: "Add Restraint", value: "restraintAdd"},
    { label: "Remove Restraint", value: "restraintRemove"},
    { label: "Add Object", value: "objectAdd"},
    { label: "Remove Object", value: "objectRemove"},
    { label: "Add Location", value: "locationAdd"},
    { label: "Remove Location", value: "locationRemove"},
    { label: "Update Location", value: "locationUpdate"},
    { label: "Set State", value: "stateSet"},
    { label: "Set Flag", value: "flagSet"},
    { label: "Show Dialog", value: "dialogShow"},
];
export interface GameInteractionNodeResult {
    type:  GameInteractionNodeResultType;
    args:  [string, string];
}

export type GameInteractionNodeType = "criteria_or" | "criteria_and" | "flag_map" | "execute";
export let interactionNodeTypeSelectData: { label: string; value: GameInteractionNodeType }[] = [
    { label: "Criteria (OR)", value: "criteria_or"},
    { label: "Criteria (AND)", value: "criteria_and"},
    { label: "Flag Map", value: "flag_map"},
    { label: "Execute", value: "execute"},
];

export interface GameInteractionNodeFlagMap {
    value: string;
    node:  string;
}
export interface GameInteractionNode {
    title:    string;
    type:     GameInteractionNodeType;
    start:    boolean; // Is start state
    end:      boolean; // Is end state
    nextPass: string;
    // Criteria
    criteria: OrderedData<GameInteractionNodeCriteria>;
    nextFail: string; // If criteria fails
    // Results
    results:  OrderedData<GameInteractionNodeResult>;
    // Flag Mapping
    flagKey:  string;
    flagMap:  OrderedData<GameInteractionNodeFlagMap>;
}

export interface GameTag {
    key: string;
}
export interface GameObject {
    name:    string;
    display: string;
    examine: string;
    tags:    OrderedData<GameTag>;
}
export interface GameRestraint extends GameObject {
    bodyPart: string;
}

export type GameImageAreaType = "circle" | "polygon";
export let gameImageAreaTypeSelectData: { label: string; value: GameImageAreaType }[] = [
    { label: "Circle", value: "circle"},
    { label: "Polygon", value: "polygon"},
];
export interface GameImageArea {
    name:      string;
    dialog:    string;
    component: string;
    type:      GameImageAreaType;
    args:      number[]; // circle = 3, poly = n*2
}
export interface GameImage {
    title:  string;
    base64: string;
    areas:  OrderedData<GameImageArea>;
}

export interface GameLocation {
    name:    string;
    display: string; // Display name
    image:   string;
    initial: boolean; // At least one
}