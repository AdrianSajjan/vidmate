import { observer } from "mobx-react";

import { CanvasProvider, useInitializeMainCanvas, useInitializeRecorderCanvas } from "@/context/canvas";
import { EditorElementControls } from "@/layout/controls";

export interface EditorCanvasProps {
  page: number;
}

export function EditorCanvas(props: EditorCanvasProps) {
  return (
    <CanvasProvider page={props.page}>
      <CanvasBase {...props} />
    </CanvasProvider>
  );
}

function _CanvasBase({ ...props }: EditorCanvasProps) {
  const [main] = useInitializeMainCanvas();
  const [recorder] = useInitializeRecorderCanvas();

  return (
    <div className="absolute">
      <canvas ref={main} id={`main-canvas-${props.page}`} />
      <canvas ref={recorder} id={`recorder-canvas-${props.page}`} className="hidden" />
      <EditorElementControls />
    </div>
  );
}

const CanvasBase = observer(_CanvasBase);
