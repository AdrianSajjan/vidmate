import useMeasure from "react-use-measure";

import { useMemo } from "react";
import { clamp } from "lodash";
import { observer } from "mobx-react";
import { CopyPlusIcon, GroupIcon, PencilIcon, RepeatIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CanvasProvider, useCanvasContext, useInitializeMainCanvas, useInitializeRecorderCanvas } from "@/context/canvas";
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
  const [main] = useInitializeMainCanvas();
  const [recorder] = useInitializeRecorderCanvas();

  const mainID = `main-canvas-${props.page}`;
  const recorderID = `recorder-canvas-${props.page}`;

  return (
    <div className="absolute">
      <canvas ref={main} id={mainID} />
      <canvas ref={recorder} id={recorderID} className="hidden" />
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

  if (!canvas.selected || canvas.selected.type === "audio" || !canvas.hasControls) {
    return null;
  }

  return (
    <div ref={ref} style={style} className={cn("absolute border bg-popover text-popover-foreground shadow rounded-md outline-none flex items-center divide-x", "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2")}>
      {canvas.selected.meta?.group ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => canvas.onSelectGroup(canvas.selected!.meta?.group)}>
            <GroupIcon size={14} />
            <span>Select Group</span>
          </Button>
        </div>
      ) : null}
      {canvas.selected.type === "textbox" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2">
            <PencilIcon size={14} />
            <span>Edit</span>
          </Button>
        </div>
      ) : canvas.selected.type === "image" || canvas.selected.type === "video" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2">
            <RepeatIcon size={14} />
            <span>Replace</span>
          </Button>
        </div>
      ) : null}
      <div className="flex items-center gap-1 p-1">
        <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7">
          <CopyPlusIcon size={14} />
        </Button>
        <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7" onClick={() => canvas.onDeleteActiveObject()}>
          <Trash2Icon size={14} />
        </Button>
      </div>
    </div>
  );
}

const CanvasBase = observer(_CanvasBase);
const EditorElementControls = observer(_EditorElementControls);
