import useMeasure from "react-use-measure";

import { clamp } from "lodash";
import { CopyPlusIcon, GroupIcon, PencilIcon, RepeatIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { observer } from "mobx-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditorContext } from "@/context/editor";

const MENU_OFFSET_Y = 50;

function _EditorElementControls() {
  const editor = useEditorContext();
  const [ref, dimensions] = useMeasure();

  const style = useMemo(() => {
    if (!editor.canvas.instance) return undefined;

    const viewport = editor.canvas.viewportTransform!;
    const offsetX = viewport[4];
    const offsetY = viewport[5];

    const selected = editor.canvas.instance.getActiveObject();

    if (!selected) return undefined;

    const top = offsetY + selected.getBoundingRect(true).top! * editor.canvas.zoom - (dimensions.height / 2) * editor.canvas.zoom - MENU_OFFSET_Y;
    const left = offsetX + selected.getBoundingRect(true).left! * editor.canvas.zoom - dimensions.width / 2 + ((selected.width! * selected.scaleX!) / 2) * editor.canvas.zoom;

    return {
      top: clamp(top, MENU_OFFSET_Y / 4, editor.canvas.instance.height! - MENU_OFFSET_Y / 4),
      left: left,
    };
  }, [editor.canvas.selected, editor.canvas.viewportTransform, editor.canvas.height, editor.canvas.width, editor.canvas.zoom, dimensions]);

  if (!editor.canvas.selected || editor.canvas.selected.type === "audio" || !editor.canvas.hasControls) {
    return null;
  }

  return (
    <div ref={ref} style={style} className={cn("absolute border bg-popover text-popover-foreground shadow rounded-md outline-none flex items-center divide-x", "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2")}>
      {editor.canvas.selected.meta?.group ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.canvas.onSelectGroup(editor.canvas.selected!.meta?.group)}>
            <GroupIcon size={14} />
            <span>Select Group</span>
          </Button>
        </div>
      ) : null}
      {editor.canvas.selected.type === "textbox" || editor.canvas.selected.type === "image" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.setActiveSidebarRight("ai")}>
            <SparklesIcon size={14} />
            <span>AI Magic</span>
          </Button>
        </div>
      ) : null}
      {editor.canvas.selected.type === "textbox" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2">
            <PencilIcon size={14} />
            <span>Edit</span>
          </Button>
        </div>
      ) : editor.canvas.selected.type === "image" || editor.canvas.selected.type === "video" ? (
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
        <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7" onClick={() => editor.canvas.onDeleteActiveObject()}>
          <Trash2Icon size={14} />
        </Button>
      </div>
    </div>
  );
}

export const EditorElementControls = observer(_EditorElementControls);
