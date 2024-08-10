import { EditorAnimation } from "@/constants/animations";
import { useMemo } from "react";

const typeToTitleMap: Record<string, string> = {
  textbox: "Text Animations",
};

export function useAnimationList(object: fabric.Object, list: EditorAnimation[]) {
  const basic = useMemo(() => {
    return list.filter((animation) => !animation.type);
  }, [list]);

  const element = useMemo(() => {
    return list.filter((animation) => animation.type === object.type);
  }, [object, list]);

  return [{ title: "Basic Animations", list: basic }, element.length ? { title: typeToTitleMap[object.type!], list: element } : null].filter(Boolean) as Array<{ title: string; list: EditorAnimation[] }>;
}
