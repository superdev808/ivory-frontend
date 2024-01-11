export enum PROCEDURES {
  SURGERY = "Surgery",
  RESTORATIVE = "Restorative",
  SURGERY_AND_RESTORATIVE = "SurgeryAndRestorative",
}
export interface Procedure {
  name: string;
  value: PROCEDURES;
}
export const procedures: Procedure[] = [
  { name: "Surgery", value: PROCEDURES.SURGERY },
  { name: "Restorative", value: PROCEDURES.RESTORATIVE },
  {
    name: "Surgery and Restorative",
    value: PROCEDURES.SURGERY_AND_RESTORATIVE,
  },
];

export interface Site {
  name: string;
  key: number;
}
const SITE_COUNT: number = 32;
// Create an array of Site objects representing different sites.
// The array is initialized with SITE_COUNT number of elements and then mapped to generate Site objects.
const SITES: Site[] = Array(SITE_COUNT)
  .fill(null)
  .map((v, i) => {
    return { name: `Site ${i + 1}`, key: i + 1 };
  });

// Create two subsets of sites: UPPER_SITES and LOWER_SITES.
// UPPER_SITES contains the first 16 sites, and LOWER_SITES contains the next 16 sites.
export const UPPER_SITES: Site[] = SITES.slice(0, 16);
export const LOWER_SITES: Site[] = SITES.slice(16, 32);

export interface InputDetail {
  id?: string;
  question: string;
  answer: string;
}

export interface ItemInsights {
  id?: string;
  itemName: string;
  itemNumber?: string;
  link: string;
  quantity?: number;
}
export interface ItemData {
  id?: string;
  label: string;
  info: ItemInsights[];
}
export interface ComponentDetail {
  [key: string]: ItemData[];
}

export interface SiteData {
  [key: string]: {
    inputDetails: InputDetail[];
    componentDetails: ComponentDetail;
  };
}

export interface InputOutputValues {
  name: string;
  text: string;
  calculator: string;
  outputFrom?: string;
}

export interface AutoPopulateData {
  site: Site;
  questions: InputOutputValues[];
  answerOptions: string[][];
  answers: string[];
}

export interface RadioButtonOption {
  id: string;
  name: string;
  value: string;
}

export enum QUANTITY_VISIBILITY_STATE {
  HIDE,
  SHOW,
  EDITABLE,
}

export const AUTO_POPULATE_OPTIONS: RadioButtonOption[] = [
  {
    id: "Autopopulate1",
    name: "autopopulate",
    value: "Yes",
  },
  {
    id: "Autopopulate2",
    name: "autopopulate",
    value: "No",
  },
];

export const ignoreListForMultiples: string[] = [
  "implant drill kit name",
  "drill sequence",
  "implant driver",
  "bur kit name (bone reduction)",
  "mua driver",
  "luting agent",
  "teflon tape",
  "material to close screw access hole",
];
