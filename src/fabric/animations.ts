import { EntryAnimation, ExitAnimation } from "canvas";

export interface EditorAnimation {
  label: string;
  preview: string;
  easing?: any;
  duration?: number;
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
    duration: 500,
  },
  {
    value: "slide-in-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "pan-in-left",
    label: "Pan Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "slide-in-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "pan-in-right",
    label: "Pan Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
  },
  {
    value: "rise-in-up",
    label: "Rise Up",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 500,
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

export const easing: EditorEasings[] = [
  {
    label: "Linear",
    value: "linear",
  },
  {
    label: "Ease In Quad",
    value: "easeInQuad",
  },
  {
    label: "Ease Out Quad",
    value: "easeOutQuad",
  },
  {
    label: "Ease In Out Quad",
    value: "easeInOutQuad",
  },
  {
    label: "Ease Out In Quad",
    value: "easeOutInQuad",
  },
  {
    label: "Ease In Cubic",
    value: "easeInCubic",
  },
  {
    label: "Ease Out Cubic",
    value: "easeOutCubic",
  },
  {
    label: "Ease In Out Cubic",
    value: "easeInOutCubic",
  },
  {
    label: "Ease Out In Cubic",
    value: "easeOutInCubic",
  },
  {
    label: "Ease In Quart",
    value: "easeInQuart",
  },
  {
    label: "Ease Out Quart",
    value: "easeOutQuart",
  },
  {
    label: "Ease In Out Quart",
    value: "easeInOutQuart",
  },
  {
    label: "Ease Out In Quart",
    value: "easeOutInQuart",
  },
  {
    label: "Ease In Quint",
    value: "easeInQuint",
  },
  {
    label: "Ease Out Quint",
    value: "easeOutQuint",
  },
  {
    label: "Ease In Out Quint",
    value: "easeInOutQuint",
  },
  {
    label: "Ease Out In Quint",
    value: "easeOutInQuint",
  },
  {
    label: "Ease In Sine",
    value: "easeInSine",
  },
  {
    label: "Ease Out Sine",
    value: "easeOutSine",
  },
  {
    label: "Ease In Out Sine",
    value: "easeInOutSine",
  },
  {
    label: "Ease Out In Sine",
    value: "easeOutInSine",
  },
  {
    label: "Ease In Expo",
    value: "easeInExpo",
  },
  {
    label: "Ease Out Expo",
    value: "easeOutExpo",
  },
  {
    label: "Ease In Out Expo",
    value: "easeInOutExpo",
  },
  {
    label: "Ease Out In Expo",
    value: "easeOutInExpo",
  },
  {
    label: "Ease In Circ",
    value: "easeInCirc",
  },
  {
    label: "Ease Out Circ",
    value: "easeOutCirc",
  },
  {
    label: "Ease In Out Circ",
    value: "easeInOutCirc",
  },
  {
    label: "Ease Out In Circ",
    value: "easeOutInCirc",
  },
  {
    label: "Ease In Back",
    value: "easeInBack",
  },
  {
    label: "Ease Out Back",
    value: "easeOutBack",
  },
  {
    label: "Ease In Out Back",
    value: "easeInOutBack",
  },
  {
    label: "Ease Out In Back",
    value: "easeOutInBack",
  },
  {
    label: "Ease In Bounce",
    value: "easeInBounce",
  },
  {
    label: "Ease Out Bounce",
    value: "easeOutBounce",
  },
  {
    label: "Ease In Out Bounce",
    value: "easeInOutBounce",
  },
  {
    label: "Ease Out In Bounce",
    value: "easeOutInBounce",
  },
];
