import { EditorAnimation } from "@/constants/animations";
import { useEditorContext } from "@/context/editor";
import { ChangeEventHandler } from "react";

export function useAnimationControls(selected: fabric.Object, type: "in" | "out" | "scene") {
  const editor = useEditorContext();

  const selectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangeActiveObjectAnimation(type, animation.value);
    if (animation.value !== "none") {
      const duration = animation.fixed?.duration ? animation.duration : selected.anim?.in.duration;
      const easing = animation.fixed?.easing ? animation.easing : selected.anim?.in.easing;
      editor.canvas.onChangeActiveObjectAnimationDuration(type, duration || 500);
      editor.canvas.onChangeActiveObjectAnimationEasing(type, easing || "linear");
    }
  };

  const changeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangeActiveObjectAnimationDuration(type, value);
  };

  const changeEasing = (easing: string) => {
    editor.canvas.onChangeActiveObjectAnimationEasing(type, easing);
  };

  const changeTextAnimate = (animate: string) => {
    editor.canvas.onChangeActiveTextAnimationType(type, animate as "letter" | "word");
  };

  return {
    selectAnimation,
    changeDuration,
    changeEasing,
    changeTextAnimate,
  };
}
