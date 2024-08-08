import { useEffect, useMemo } from "react";
import { useEditorContext } from "@/context/editor";
import { debounce } from "lodash";

export function usePreviewAnimation(element: fabric.Object, type: "in" | "out" | "scene") {
  const editor = useEditorContext();

  const previewAnimation = useMemo(() => {
    return debounce((object: fabric.Object | null) => {
      editor.canvas.animations.dispose(object);
      if (object) editor.canvas.animations.preview(object, type, object.anim!);
    }, 250);
  }, []);

  useEffect(() => {
    const object = editor.canvas.instance.getItemByName(element.name);
    previewAnimation(object);
    return () => {
      previewAnimation.cancel();
      editor.canvas.animations.dispose(object);
    };
  }, [element.anim]);
}
