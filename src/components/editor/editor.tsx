import { Fragment, useEffect } from "react";
import { CanvasProvider, useCanvasContext, useInitializeCanvas } from "@/context/canvas";
import { observer } from "mobx-react";

interface EditorCanvasProps {
  page: number;
  height: number;
  width: number;
}

export function EditorCanvas(props: EditorCanvasProps) {
  return (
    <CanvasProvider page={props.page}>
      <CanvasBase {...props} />
    </CanvasProvider>
  );
}

const CanvasBase = observer(_CanvasBase);

function _CanvasBase({ height, width }: EditorCanvasProps) {
  const store = useCanvasContext();
  const [canvas, { isInitialized }] = useInitializeCanvas();

  useEffect(() => {
    if (!height || !width || !isInitialized) return;
    store.onUpdateResponsiveCanvas({ height, width });
  }, [store, height, width, isInitialized]);

  return (
    <Fragment>
      <div className="absolute">
        <canvas ref={canvas} />
      </div>
    </Fragment>
  );
}
