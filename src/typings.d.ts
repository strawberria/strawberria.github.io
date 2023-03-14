import type { SvelteComponent } from "svelte";

export interface NavigationTabData { 
    [key: string]: { 
        display:   string;
        component: typeof SvelteComponent;
    }
}

export interface ProjectData {
    custodial: {
        version: string;
    };
    game: {
        metadata: {
            title:    string;
            author:   string;
            version:  string;
            synopsis: string;
        }
        actions:             string[];
        images:              string[];
        states:              string[];
        restraints:          string[];
        restraintLocations:  string[];
        objects:             string[];
        interactions:        string[];
        locations:           string[];
    }
    data: {
        actions:             StoredData<ProjectActionData>;
        images:              StoredData<ProjectImageData>;
        states:              StoredData<ProjectStateData>;
        restraints:          StoredData<ProjectRestraintData>;
        restraintLocations:  StoredData<ProjectRestraintLocationData>;
        objects:             StoredData<ProjectObjectData>;
        interactions:        StoredData<ProjectInteractionData>;
        locations:           StoredData<ProjectLocationData>;
    }
}

export interface ProjectConstruct {
    id: string;
}

export interface ProjectActionData extends ProjectConstruct {
    name:  string;
    verb:  string;
    order: boolean;
    two:   boolean;
}

export interface ProjectImageData extends ProjectConstruct {
    imageb64:   string | null;
    devName:    string;
    resolution: [number, number] | null;
}

export type ProjectStateType = "normal" | "transition" | "goodEnding" | "badEnding";
export interface ProjectHintData { attempts: number; text: string };
export interface ProjectStateData extends ProjectConstruct {
    devName:                 string;
    description:             string;
    notes:                   string;
    imageID:                 string | null;
    type:                    ProjectStateType;
    args:                    any[]; // next state for transition?
    availableActionIDs:      string[];
    availableLocationIDs:    string[];
    hints:                   [ProjectHintData, ProjectHintData, ProjectHintData, ProjectHintData, ProjectHintData];
    maxAttempts:             number;
    transitionStateID:       string | null;
    // locationIDs: string[];   
}

export interface ProjectRestraintLocationData extends ProjectConstruct {
    name:               string;
    initialRestraintID: string | null;
}

export interface ProjectRestraintData extends ProjectConstruct {
    name:                string;
    devName:             string;
    restraintLocationID: string | null;
    tags:                string[];
    examine:             string;
}

export interface ProjectObjectData extends ProjectConstruct {
    name:    string;
    devName: string;
    tags:    string[];
    examine: string;
    initial: boolean;
}

export interface ProjectInteractionData extends ProjectConstruct {
    devName:        string;
    actionID:       string | null;
    stateID:        string | null;
    componentTypes: [
        "restraints" | "restraintLocations" | "objects", 
        "restraints" | "restraintLocations" | "objects"
    ];
    componentIDs:   [string | null, string | null];
    order: {
        criteria: string[];
        results:  string[];
    };
    data: {
        criteria: StoredData<ProjectInteractionCriteriaData>;
        results:  StoredData<ProjectInteractionResultData>;
    };
}

export type ProjectInteractionCriteriaType = "flagEquals" | "flagNotEquals" 
    | "restraintWearing" | "restraintNotWearing" | "restraintWearingTag" 
    | "restraintNotWearingTag" | "objectFound" | "objectNotFound"
    | "objectFoundTag" | "objectNotFoundTag" | "targetTag_component1" | "targetTag_component2";
export interface ProjectInteractionCriteriaData extends ProjectConstruct {
    devName: string;
    type:    ProjectInteractionCriteriaType;
    args:    any[];
}

export type ProjectInteractionResultType = "restraintAdd" | "restraintRemove"
    | "restraintAddTarget" | "restraintRemoveTarget"
    | "objectReveal" | "objectHide" | "setState" | "setFlag" | "showDialog"
    | "locationAdd" | "locationRemove";
export interface ProjectInteractionResultData extends ProjectConstruct {
    devName: string;
    type:    ProjectInteractionResultType;
    args:    any[];
}

export interface ProjectLocationData extends ProjectConstruct {
    name:    string;
    devName: string;
    initial: boolean;
    imageID: string | null;
    order: {
        locationObjects: string[];
    };
    data: {
        locationObjects: StoredData<ProjectLocationObjectData>;
    };
}

export type ProjectLocationObjectType = "circle" | "vector";
export interface ProjectLocationObjectData extends ProjectConstruct {
    devName:  string;
    type:     ProjectLocationObjectType;
    args:     [number, number][];
    dialog:   string;
    objectID: string | null;
    // no interactionID because hassle
}

export interface SelectorRadioData {
    id:        string;
    component: typeof SvelteComponentDev, 
    props:     any;
}
export type SelectorMultipleData = SelectorRadioData;

export interface StoredData<T> {
    [id: string]: T
}

export interface SelectChoiceData {
    key:     any;
    display: string;
    enabled: boolean;
}