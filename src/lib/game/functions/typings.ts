// Represents current progress within the game
export interface ProgressData {
    state:      string; 
    objects:    string[];
    restraints: { [bodyPartID: string]: string };
    locations:  string[];
    flags:      { [flagKey: string]: string };
    attempts:   number;   // For hints, trigger when equals
    needReveal: string[]; // Only for initial objects / restraints
}