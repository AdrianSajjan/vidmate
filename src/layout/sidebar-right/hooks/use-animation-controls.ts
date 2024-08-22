import { defaultSpringConfig, EditorAnimation } from "@/constants/animations";
import { useEditorContext } from "@/context/editor";
import { FabricUtils } from "@/fabric/utils";
import { ChangeEventHandler } from "react";

export function useAnimationControls(selected: fabric.Object, type: "in" | "out" | "scene") {
  const editor = useEditorContext();

  const selectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangeActiveObjectAnimation(type, animation.value);
    if (animation.value !== "none") {
      const duration = animation.fixed?.duration ? animation.duration : selected.anim?.[type].duration;
      const easing = animation.fixed?.easing ? animation.easing : selected.anim?.[type].easing;
      editor.canvas.onChangeActiveObjectAnimationDuration(type, duration || 500);
      editor.canvas.onChangeActiveObjectAnimationEasing(type, easing || "linear");
      if (FabricUtils.isTextboxElement(selected)) {
        const animate = animation.fixed?.text ? animation.text : selected.anim?.[type].text;
        editor.canvas.onChangeActiveTextAnimationType(type, animate);
      }
    }
  };

  const changeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangeActiveObjectAnimationDuration(type, value);
  };

  const changeEasing = (easing: string) => {
    editor.canvas.onChangeActiveObjectAnimationEasing(type, easing);
    if (easing === "spring") editor.canvas.onChangeActiveObjectAnimationPhysics(type, selected.anim?.[type]?.config || defaultSpringConfig);
  };

  const changePhysics = (config: Partial<fabric.AnimationPhysics>) => {
    editor.canvas.onChangeActiveObjectAnimationPhysics(type, config);
  };

  const changeTextAnimate = (animate: string) => {
    editor.canvas.onChangeActiveTextAnimationType(type, animate as fabric.TextAnimateOptions);
  };

  return {
    selectAnimation,
    changeDuration,
    changeEasing,
    changePhysics,
    changeTextAnimate,
  };
}
