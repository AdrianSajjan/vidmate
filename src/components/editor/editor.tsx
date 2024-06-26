import { Fragment, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { CopyPlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CanvasProvider, useCanvasContext, useInitializeCanvas } from "@/context/canvas";
import { cn } from "@/lib/utils";
import useMeasure from "react-use-measure";

const MENU_OFFSET_Y = 35;

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
  const canvas = useCanvasContext();

  const [menuRef, dimensions] = useMeasure();
  const [canvasRef, { isInitialized }] = useInitializeCanvas();

  useEffect(() => {
    if (!height || !width || !isInitialized) return;
    canvas.onUpdateResponsiveCanvas({ height, width });
  }, [canvas, height, width, isInitialized]);

  const style = useMemo(() => {
    if (!canvas.selected || !canvas.instance) return undefined;

    const viewport = canvas.instance.viewportTransform!;

    const offsetX = viewport[4];
    const offsetY = viewport[5];

    return {
      top: offsetY + canvas.selected.top! * canvas.zoom - dimensions.height / 2 - (canvas.selected.height! / 2) * canvas.zoom - MENU_OFFSET_Y,
      left: offsetX + canvas.selected.left! * canvas.zoom - dimensions.width / 2,
    };
  }, [canvas.selected, canvas.instance, canvas.height, canvas.width, canvas.zoom, dimensions]);

  return (
    <Fragment>
      <div className="absolute">
        <canvas ref={canvasRef} />
      </div>
      <div
        ref={menuRef}
        style={style}
        className={cn(
          "absolute border bg-popover text-popover-foreground shadow rounded-lg outline-none items-center gap-0.5 p-0.5",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
          !canvas.selected || !canvas.hasControls ? "hidden" : "flex"
        )}
      >
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled>
          <CopyPlusIcon size={14} />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => canvas.onDeleteObjectByName(canvas.selected?.name)}>
          <Trash2Icon size={14} />
        </Button>
      </div>
    </Fragment>
  );
}
