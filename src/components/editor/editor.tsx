import { observer } from "mobx-react";

import { CanvasProvider, useInitializeCanvas } from "@/context/canvas";
import { EditorElementControls } from "@/layout/controls";

export interface EditorCanvasProps {
  page: number;
}

export function EditorCanvas(props: EditorCanvasProps) {
  return (
    <CanvasProvider page={props.page}>
      <Canvas {...props} />
    </CanvasProvider>
  );
}

function _Canvas({ page }: EditorCanvasProps) {
  const [ref] = useInitializeCanvas();
  const name = `canvas-${page}`;

  return (
    <div className="absolute">
      <canvas ref={ref} id={name} />
      <EditorElementControls />
    </div>
  );
}

const Canvas = observer(_Canvas);
