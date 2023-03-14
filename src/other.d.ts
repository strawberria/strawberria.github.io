export interface GameData {
    updated:  number; // unix timestamp in ms
    engine:   string;
    title:    string;
    author:   string;
    synopsis: string;
    version:  string;
    path:     string;
}

export interface ScrollingRadioData {
    key:       string;
    component: typeof SvelteComponentDev, 
    props:     any;
}