import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";
import { TooltipProvider } from "@/components/ui/tooltip";

import { TextToolbar } from "./components/text";
import { ShapeToolbar } from "./components/shape";
import { LineToolbar } from "./components/line";

import { ImageToolbar } from "./components/image";
import { VideoToolbar } from "./components/video";
import { CropToolbar } from "./components/crop";

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
  const Toolbar = editor.canvas.selected ? toolbarComponentMap[editor.canvas.selected.type!] : null;

  if (editor.canvas.crop) {
    return (
      <TooltipProvider>
        <div className="h-14 bg-card/50 border-b px-4 shrink-0 overflow-x-scroll">
          <CropToolbar />
        </div>
      </TooltipProvider>
    );
  }

  if (!Toolbar) {
    return <div className="h-14 bg-card/50 border-b px-4 shrink-0 overflow-x-scroll" />;
  }

  return (
    <TooltipProvider>
      <div className="h-14 bg-card/50 border-b px-4 shrink-0 overflow-x-scroll">
        <Toolbar />
      </div>
    </TooltipProvider>
  );
}

export const EditorToolbar = observer(_EditorToolbar);
