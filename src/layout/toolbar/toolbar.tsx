import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";
import { useIsTablet } from "@/hooks/use-media-query";

import { TextToolbar } from "./components/text";
import { ShapeToolbar } from "./components/shape";
import { LineToolbar } from "./components/line";

import { ImageToolbar } from "./components/image";
import { VideoToolbar } from "./components/video";
import { AudioToolbar } from "./components/audio";
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
  audio: AudioToolbar,
  crop: CropToolbar,
  trim: TrimToolbar,
};

function _EditorToolbar() {
  const isTablet = useIsTablet();
  const editor = useEditorContext();

  const type = editor.canvas.cropper?.active ? "crop" : editor.canvas.trimmer?.active ? "trim" : editor.canvas.selection?.active?.type;
  const Toolbar = toolbarComponentMap[type!];

  if (!isTablet) {
    return Toolbar ? (
      <aside className="h-16 absolute bottom-0 left-0 bg-card dark:bg-gray-900/40 border-t border-t-border/25 flex items-center z-20 gap-2.5 w-screen overflow-x-scroll px-4">
        <Toolbar />
      </aside>
    ) : null;
  }

  return Toolbar ? (
    <div className="h-14 bg-card/50 border-b border-b-border/50 px-4 shrink-0 overflow-x-scroll">
      <Toolbar />
    </div>
  ) : (
    <div className="h-14 bg-card/50 border-b border-b-border/50 px-4 shrink-0 overflow-x-scroll" />
  );
}

export const EditorToolbar = observer(_EditorToolbar);
