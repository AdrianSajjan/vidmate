import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";

import { TextToolbar } from "./components/text";
import { ShapeToolbar } from "./components/shape";
import { LineToolbar } from "./components/line";

import { ImageToolbar } from "./components/image";
import { VideoToolbar } from "./components/video";
import { CropToolbar } from "./components/crop";
import { TrimToolbar } from "./components/trim";

const toolbarComponentMap: Record<string, () => JSX.Element> = {
  textbox: TextToolbar,
  image: ImageToolbar,
  video: VideoToolbar,
  triangle: ShapeToolbar,
  path: ShapeToolbar,
  circle: ShapeToolbar,
  ellipse: ShapeToolbar,
  rect: ShapeToolbar,
  line: LineToolbar,
};

function _EditorToolbar() {
  const editor = useEditorContext();
  const Toolbar = editor.canvas.crop ? CropToolbar : editor.canvas.trim ? TrimToolbar : editor.canvas.selected ? toolbarComponentMap[editor.canvas.selected.type!] : null;

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
