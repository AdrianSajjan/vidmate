import { observer } from "mobx-react";

import { EditorElementControls } from "@/layout/controls";
import { useInitializeCanvas } from "@/hooks/use-canvas";

export interface EditorCanvasProps {
  page: number;
}

function _EditorCanvas({ page }: EditorCanvasProps) {
  const [ref] = useInitializeCanvas();
  const name = `canvas-${page}`;

  return (
    <div className="absolute">
      <canvas ref={ref} id={name} />
      <EditorElementControls />
    </div>
  );
}

export const EditorCanvas = observer(_EditorCanvas);
