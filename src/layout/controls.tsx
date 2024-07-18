import { clamp } from "lodash";
import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useMemo } from "react";
import { CopyPlusIcon, GroupIcon, PencilIcon, RepeatIcon, SparklesIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";

const MENU_OFFSET_Y = 60;

function _EditorElementControls() {
  const editor = useEditorContext();
  if (!editor.canvas.selection || !editor.canvas.workspace || !editor.canvas.controls || !editor.canvas.selection.active || !!editor.canvas.cropper.active || editor.canvas.selection.active.type === "audio") return null;
  return <EditorElementControlsBase />;
}

function _EditorElementControlsBase() {
  const editor = useEditorContext();

  const workspace = editor.canvas.workspace;
  const selected = editor.canvas.selection.active!;

  const style = useMemo(() => {
    const selected = editor.canvas.instance.getActiveObject();
    const viewport = workspace.viewportTransform;

    if (!selected) return;

    const offsetX = viewport[4];
    const offsetY = viewport[5];

    const top = offsetY + selected.getBoundingRect(true).top! * workspace.zoom - MENU_OFFSET_Y;
    const left = offsetX + selected.getBoundingRect(true).left! * workspace.zoom + ((selected.width! * selected.scaleX!) / 2) * workspace.zoom;

    return {
      top: clamp(top, MENU_OFFSET_Y / 4, editor.canvas.instance.height! - MENU_OFFSET_Y / 4),
      left: left,
    };
  }, [selected, workspace.viewportTransform, workspace.height, workspace.width, workspace.zoom]);

  const handleReplaceObject = () => {
    if (editor.canvas.replacer.active) {
      editor.canvas.replacer.mark(null);
    } else {
      const replace = editor.canvas.replacer.mark(editor.canvas.instance.getActiveObject());
      if (replace) editor.setActiveSidebarLeft(`${replace.type}s`);
    }
  };

  return (
    <motion.div style={style} className="absolute border bg-popover text-popover-foreground shadow rounded-md outline-none items-center divide-x flex -translate-x-1/2">
      {selected.meta?.group ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.canvas.selection.selectMetaGroup(selected.meta!.group)}>
            <GroupIcon size={14} />
            <span>Select Group</span>
          </Button>
        </div>
      ) : null}
      {selected.type === "textbox" || selected.type === "image" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.setActiveSidebarRight("ai")}>
            <SparklesIcon size={14} />
            <span>AI Magic</span>
          </Button>
        </div>
      ) : null}
      {selected.type === "textbox" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2">
            <PencilIcon size={14} />
            <span>Edit</span>
          </Button>
        </div>
      ) : selected.type === "image" || selected.type === "video" ? (
        <div className="flex items-center p-1" onClick={handleReplaceObject}>
          <Button size="sm" variant={editor.canvas.replacer.active ? "default" : "ghost"} className="gap-1.5 rounded-sm h-7 px-2 transition-none">
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
    </motion.div>
  );
}

export const EditorElementControls = observer(_EditorElementControls);
const EditorElementControlsBase = observer(_EditorElementControlsBase);
