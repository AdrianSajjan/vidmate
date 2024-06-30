import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";

import { TextToolbar } from "./components/text";
import { ShapeToolbar } from "./components/shape";
import { ImageToolbar } from "./components/image";

const toolbarComponentMap: Record<string, () => JSX.Element> = {
  textbox: TextToolbar,
  image: ImageToolbar,
  triangle: ShapeToolbar,
  path: ShapeToolbar,
  circle: ShapeToolbar,
  ellipse: ShapeToolbar,
  rect: ShapeToolbar,
};

function _EditorToolbar() {
  const editor = useEditorContext();
  const Toolbar = editor.canvas.selected ? toolbarComponentMap[editor.canvas.selected.type!] : null;

  if (!Toolbar) {
    return <div className="h-14 bg-card/50 border-b px-4 shrink-0 overflow-x-scroll" />;
  }

  return (
    <div className="h-14 bg-card/50 border-b px-4 shrink-0 overflow-x-scroll">
      <Toolbar />
    </div>
  );
}

export const EditorToolbar = observer(_EditorToolbar);
