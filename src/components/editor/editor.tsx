import { observer } from "mobx-react";

import { EditorElementControls } from "@/layout/controls";
import { useInitializeCanvas } from "@/hooks/use-canvas";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

export interface EditorCanvasProps {
  page: number;
}

function _EditorCanvas({ page }: EditorCanvasProps) {
  const editor = useEditorContext();
  const [ref] = useInitializeCanvas(page);

  const name = `canvas-${page}`;

  return (
    <div className={cn("absolute", editor.page !== page ? "opacity-0 z-0" : "opacity-100 z-10")}>
      <canvas ref={ref} id={name} />
      <EditorElementControls />
    </div>
  );
}

export const EditorCanvas = observer(_EditorCanvas);
