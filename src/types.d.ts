export const version = "1.6.0";

export interface GameData {
    filename: string;
    updated:  number; // unix timestamp in ms
    title:    string;
    author:   string;
    synopsis: string;
    version:  string;
}

export interface RuntimeData {
    action:       string;
    currentState: string;
    objects:      string[];
    flags:        { [key: string]: string };
}

// == Copied from the development engine ==

export interface ScrollingRadioData {
    key:       string;
    component: typeof SvelteComponentDev, 
    props:     any;
};

export interface OrderedProjectData<T> {
    data:     { [id: string]: T };
    ordering: string[];
};
export interface ProjectConstruct {
    id: string;
}

export type StateType = "normal" | "opening" | "starting" | "goodEnd" | "badEnd";
export type HintData = { attempts: number; text: string };
export interface ProjectStateData extends ProjectConstruct {
    title:          string;
    description:    string;
    imageB64:       string; // base64-encoded
    type:           StateType;
    args:           any[];
    interactions:   OrderedProjectData<ProjectInteractionData>;
    hints:          [HintData, HintData, HintData, HintData, HintData];
    locations:      OrderedProjectData<ProjectMinimapLocationData>
}
export interface ProjectActionData extends ProjectConstruct {
    name:  string;
    verb:  string;
    order: boolean;
    two:   boolean;
}
export interface ProjectRestraintLocationData extends ProjectConstruct {
    name:    string;
    initial: string;
}
export interface ProjectRestraintData extends ProjectConstruct {
    name:     string;
    location: string;
    examine:  string;
}
export interface ProjectObjectData extends ProjectConstruct {
    name:    string;
    devName: string;
    examine: string;
}
export interface ProjectInteractionData extends ProjectConstruct {
    devName:    string;
    action:     string;
    components: [string, string];
    criteria:   OrderedProjectData<ProjectInteractionCriteriaData>;
    results:    OrderedProjectData<ProjectInteractionResultData>;
}

export interface ProjectMinimapLocationData extends ProjectConstruct {
    name:    string;
    devName: string;
    minimapB64:     string; // base64-encoded
    minimapObjects: OrderedProjectData<ProjectMinimapObjectData>;
}
export type MinimapObjectType = "circle" | "vector";
export interface ProjectMinimapObjectData extends ProjectConstruct {
    devName: string;
    type:    MinimapObjectType;
    args:    [number, number][];  
    dialog:  string; // Dialog text when clicked
    object:  string; // Referenced object
}
export type InteractionCriteriaType = "flagEquals" | "flagNotEquals" | "restraintWearing" | "restraintNotWearing" | "objectFound" | "objectNotFound" | "exceededAttempts";
export interface ProjectInteractionCriteriaData extends ProjectConstruct {
    devName: string;
    type:    InteractionCriteriaType;
    args:    any[];
}
export type InteractionResultType = "restraintAdd" | "restraintRemove" | "objectReveal" | "objectHide" | "setState" | "setFlag" | "popupDialog" | "popupCombinationLock";
export interface ProjectInteractionResultData extends ProjectConstruct {
    devName: string;
    type:    InteractionResultType;
    args:    any[];
}

export interface ProjectData {
    data: {
        information: {
            title:          string;
            author:         string;
            synopsis:       string;
            version:        string;
        };
        actions: OrderedProjectData<ProjectActionData>;
        restraintLocations: OrderedProjectData<ProjectRestraintLocationData>;
    }
    storage: {
        states:       OrderedProjectData<ProjectStateData>;
        restraints:   OrderedProjectData<ProjectRestraintData>;
        objects:      OrderedProjectData<ProjectObjectData>;
    }
}