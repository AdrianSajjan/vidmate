interface AnimationInputState {
  duration?: boolean;
  easing?: boolean;
  text?: boolean;
}
export interface EditorAnimation {
  label: string;
  type?: string;
  preview: string;
  easing?: any;
  duration?: number;
  text?: fabric.TextAnimateOptions;
  fixed?: AnimationInputState;
  disabled?: AnimationInputState;
  value: fabric.EntryAnimation | fabric.ExitAnimation | fabric.SceneAnimations;
}

export interface EditorEasing {
  label: string;
  value: string;
}

export const defaultSpringConfig = {
  damping: 10,
  mass: 1,
  stiffness: 100,
  velocity: 0,
};

export const entry: EditorAnimation[] = [
  {
    value: "none",
    label: "None",
    preview: "https://static.canva.com/web/images/490a466560cd4cb74e3b498b7758c6ab.png",
  },
  {
    value: "fade",
    label: "Fade",
    preview: "https://static.canva.com/web/images/03b224650e1e56481c53ffcea0dd5552.png",
    duration: 250,
  },
  {
    value: "slide-left",
    label: "Slide Left",
    preview: "https://static.canva.com/web/images/33ea271a29928bed2f6d065c2f061c7c.png",
    duration: 250,
  },
  {
    value: "slide-right",
    label: "Slide Right",
    preview: "https://static.canva.com/web/images/33ea271a29928bed2f6d065c2f061c7c.png",
    duration: 250,
  },
  {
    value: "pan-left",
    label: "Pan Left",
    preview: "https://static.canva.com/web/images/33ea271a29928bed2f6d065c2f061c7c.png",
    duration: 250,
  },
  {
    value: "pan-right",
    label: "Pan Right",
    preview: "https://static.canva.com/web/images/33ea271a29928bed2f6d065c2f061c7c.png",
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
    preview: "https://static.canva.com/web/images/e6bc72bb5e49525b4a9761ca9a975c7e.png",
    duration: 250,
  },
  {
    value: "baseline",
    label: "Baseline",
    preview: "https://static.canva.com/web/images/e551964859e9860b5ec41fa1495f93f3.png",
    duration: 250,
  },
  {
    value: "pop",
    label: "Pop",
    preview: "https://static.canva.com/web/images/6bbc389e6ef05af613c38128c0de41d8.png",
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
    value: "block",
    label: "Block",
    preview: "https://static.canva.com/web/images/e4c91419da2c6ab8f7fb326928c7dde4.png",
    duration: 1500,
    easing: "easeOutSine",
    fixed: {
      duration: true,
      easing: true,
    },
    disabled: {
      text: true,
    },
  },
  {
    type: "textbox",
    value: "merge",
    label: "Merge",
    preview: "https://static.canva.com/web/images/0f06cdb9e7ef044e8352610e056c44c8.png",
    duration: 1500,
    text: "word",
    fixed: {
      duration: true,
      text: true,
    },
    disabled: {
      text: true,
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
    preview: "https://static.canva.com/web/images/1674208cbab586db23a6c64d470cbdb3.png",
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
    preview: "https://static.canva.com/web/images/f4584bd384ef87e5b9b41721cae94b7c.png",
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
