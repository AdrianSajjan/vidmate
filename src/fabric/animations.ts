import { EntryAnimation } from "canvas";

export interface EditorAnimation {
  label: string;
  preview: string;
  duration?: number;
  value: EntryAnimation;
}

export const entry: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "",
  },
  {
    value: "fade-in",
    label: "Fade",
    preview: "",
    duration: 500,
  },
  {
    value: "slide-in-left",
    label: "Slide Left",
    preview: "",
    duration: 500,
  },
  {
    value: "pan-in-left",
    label: "Pan Left",
    preview: "",
    duration: 500,
  },
  {
    value: "slide-in-right",
    label: "Slide Right",
    preview: "",
    duration: 500,
  },
  {
    value: "pan-in-right",
    label: "Pan Right",
    preview: "",
    duration: 500,
  },
  {
    value: "rise-in-up",
    label: "Rise Up",
    preview: "",
    duration: 500,
  },
];
