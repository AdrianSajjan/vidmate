import { EntryAnimation, ExitAnimation, SceneAnimations } from "canvas";

interface AnimationInputState {
  duration?: boolean;
  easing?: boolean;
}
export interface EditorAnimation {
  label: string;
  type?: string;
  preview: string;
  easing?: any;
  duration?: number;
  fixed?: AnimationInputState;
  disabled?: AnimationInputState;
  value: EntryAnimation | ExitAnimation | SceneAnimations;
}

export interface EditorEasing {
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
    value: "fade",
    label: "Fade",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "pan-left",
    label: "Pan Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "pan-right",
    label: "Pan Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "rise-up",
    label: "Rise Up",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "sink-down",
    label: "Sink Down",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "wipe",
    label: "Wipe",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "baseline",
    label: "Baseline",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "pop",
    label: "Pop",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 300,
    easing: "spring",
    fixed: {
      easing: true,
      duration: true,
    },
  },
  {
    type: "textbox",
    value: "typewriter",
    label: "Typewriter",
    preview: "https://static.canva.com/web/images/fbd13e0808d49322114656453f8ae3fb.png",
    duration: 1500,
    fixed: {
      duration: true,
    },
  },
  {
    type: "textbox",
    value: "burst",
    label: "Burst",
    easing: "spring",
    preview: "https://static.canva.com/web/images/0cc9d11aed1dcbbe12e10a50e571c8d7.png",
    duration: 1500,
    fixed: {
      easing: true,
      duration: true,
    },
  },
  {
    type: "textbox",
    value: "clarify",
    label: "Clarify",
    easing: "linear",
    preview: "https://static.canva.com/web/images/9d13f1d768bf12af9aa1bb2786985220.png",
    duration: 1500,
    fixed: {
      duration: true,
    },
  },
  {
    type: "textbox",
    value: "bounce",
    label: "Bounce",
    easing: "spring",
    preview: "https://static.canva.com/web/images/9d13f1d768bf12af9aa1bb2786985220.png",
    duration: 1500,
    fixed: {
      easing: true,
      duration: true,
    },
  },
  {
    type: "textbox",
    value: "ascend",
    label: "Ascend",
    easing: "linear",
    preview: "https://static.canva.com/web/images/9d13f1d768bf12af9aa1bb2786985220.png",
    duration: 1500,
    fixed: {
      duration: true,
    },
  },
];

export const exit: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
  {
    value: "fade",
    label: "Fade",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "slide-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "rise-up",
    label: "Rise Up",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "sink-down",
    label: "Sink Down",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
  },
  {
    value: "pop",
    label: "Pop",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 250,
    easing: "easeOutSine",
  },
];

export const scene: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
  {
    value: "rotate",
    label: "Rotate",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    duration: 1000,
    easing: "linear",
    fixed: {
      duration: true,
    },
  },
  {
    value: "zoom-in",
    label: "Zoom In",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    disabled: {
      duration: true,
    },
  },
  {
    value: "zoom-out",
    label: "Zoom out",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
    disabled: {
      duration: true,
    },
  },
  {
    value: "blink",
    label: "Blink",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
];

export const easings: EditorEasing[] = [
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
    label: "Ease In Elastic",
    value: "easeInElastic",
  },
  {
    label: "Ease Out Elastic",
    value: "easeOutElastic",
  },
  {
    label: "Ease In Out Elastic",
    value: "easeInOutElastic",
  },
  {
    label: "Ease Out In Elastic",
    value: "easeOutInElastic",
  },
  {
    label: "Spring",
    value: "spring",
  },
];
