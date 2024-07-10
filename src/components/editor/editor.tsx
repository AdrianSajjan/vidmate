import useMeasure from "react-use-measure";

import { useMemo } from "react";
import { clamp } from "lodash";
import { observer } from "mobx-react";
import { CopyPlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CanvasProvider, useCanvasContext, useInitializeCanvas } from "@/context/canvas";
import { cn } from "@/lib/utils";

const MENU_OFFSET_Y = 50;

interface EditorCanvasProps {
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
  const [canvasRef] = useInitializeCanvas();

  return (
    <div className="absolute">
      <canvas ref={canvasRef} />
      <EditorElementControls {...props} />
    </div>
  );
}

function _EditorElementControls({}: EditorCanvasProps) {
  const canvas = useCanvasContext();
  const [ref, dimensions] = useMeasure();

  const style = useMemo(() => {
    if (!canvas.instance) return undefined;

    const viewport = canvas.viewportTransform!;
    const offsetX = viewport[4];
    const offsetY = viewport[5];

    const selected = canvas.instance.getActiveObject();

    if (!selected) return undefined;

    const top = offsetY + selected.getBoundingRect(true).top! * canvas.zoom - (dimensions.height / 2) * canvas.zoom - MENU_OFFSET_Y;
    const left = offsetX + selected.getBoundingRect(true).left! * canvas.zoom - dimensions.width / 2 + ((selected.width! * selected.scaleX!) / 2) * canvas.zoom;

    return {
      top: clamp(top, MENU_OFFSET_Y / 4, canvas.instance.height! - MENU_OFFSET_Y / 4),
      left: left,
    };
  }, [canvas.selected, canvas.viewportTransform, canvas.height, canvas.width, canvas.zoom, dimensions]);

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "absolute border bg-popover text-popover-foreground shadow rounded-lg outline-none items-center gap-0.5 p-0.5",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
        !canvas.selected || canvas.selected.type === "audio" || !canvas.hasControls ? "hidden" : "flex",
      )}
    >
      <Button size="icon" variant="ghost" className="h-7 w-7" disabled>
        <CopyPlusIcon size={14} />
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => canvas.onDeleteObjectByName(canvas.selected?.name)}>
        <Trash2Icon size={14} />
      </Button>
    </div>
  );
}

const CanvasBase = observer(_CanvasBase);
const EditorElementControls = observer(_EditorElementControls);
