import { EntryAnimation, ExitAnimation } from "canvas";

interface FixedAnimations {
  duration?: boolean;
  easing?: boolean;
}
export interface EditorAnimation {
  label: string;
  preview: string;
  easing?: any;
  duration?: number;
  fixed?: FixedAnimations;
  value: EntryAnimation | ExitAnimation;
}

export interface EditorEasings {
  label: string;
  value: string;
}

export const entry: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
  {
    value: "fade-in",
    label: "Fade",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-in-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-in-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "rise-in-up",
    label: "Rise Up",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "rise-in-down",
    label: "Rise Down",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "pop-in",
    label: "Pop",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
    easing: "spring(1, 80, 10, 0)",
    fixed: { duration: true, easing: true },
  },
];

export const exit: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
  {
    value: "fade-out",
    label: "Fade",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "slide-out-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "pan-out-left",
    label: "Pan Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "slide-out-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "pan-out-right",
    label: "Pan Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "rise-out-up",
    label: "Rise Up",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
];

export const easings: EditorEasings[] = [
  {
    label: "Linear",
    value: "linear",
  },
  {
    label: "Ease In",
    value: "easeInSine",
  },
  {
    label: "Ease Out",
    value: "easeOutSine",
  },
  {
    label: "Ease In Out",
    value: "easeInOutSine",
  },
  {
    label: "Ease Out In",
    value: "easeOutInSine",
  },
  {
    label: "Spring",
    value: "spring(1, 80, 10, 0)",
  },
];
