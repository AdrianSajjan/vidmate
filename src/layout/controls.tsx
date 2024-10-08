import { clamp } from "lodash";
import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useMemo } from "react";
import { CheckIcon, CopyPlusIcon, GroupIcon, LinkIcon, PencilIcon, RepeatIcon, SendToBackIcon, SparklesIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";
import { FabricUtils } from "@/fabric/utils";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { align, move, placeholders } from "@/constants/editor";
import { cn } from "@/lib/utils";

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
      top: clamp(top, MENU_OFFSET_Y / 4, editor.canvas.instance.height! - MENU_OFFSET_Y),
      left: clamp(left, MENU_OFFSET_Y * 2.5, editor.canvas.instance.width! - MENU_OFFSET_Y * 2.5),
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
    <motion.div style={style} className="absolute border bg-popover text-popover-foreground shadow rounded-md outline-none items-center divide-x flex -translate-x-1/2 z-20">
      {selected.meta?.group ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.canvas.selection.selectMetaGroup(selected.meta!.group)}>
            <GroupIcon size={14} />
            <span>Select Group</span>
          </Button>
        </div>
      ) : null}
      {(selected.type === "textbox" || selected.type === "image") && editor.mode === "adapter" ? (
        <div className="flex items-center p-1">
          <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.setActiveSidebarRight("ai")}>
            <SparklesIcon size={14} />
            <span>AI Magic</span>
          </Button>
        </div>
      ) : null}
      {FabricUtils.isTextboxElement(selected) ? (
        <div className="flex items-center p-1">
          {selected.isEditing ? (
            <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.canvas.onExitActiveTextboxEdit()}>
              <CheckIcon size={14} />
              <span>Finish</span>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="gap-1.5 rounded-sm h-7 px-2" onClick={() => editor.canvas.onEnterActiveTextboxEdit()}>
              <PencilIcon size={14} />
              <span>Edit</span>
            </Button>
          )}
        </div>
      ) : selected.type === "image" || selected.type === "video" ? (
        <div className="flex items-center p-1" onClick={handleReplaceObject}>
          <Button size="sm" variant={editor.canvas.replacer.active ? "default" : "ghost"} className="gap-1.5 rounded-sm h-7 px-2 transition-none">
            <RepeatIcon size={14} />
            <span>Replace</span>
          </Button>
        </div>
      ) : null}
      {editor.mode === "creator" ? (
        <div className="flex items-center p-1">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("gap-1.5 rounded-sm h-7 px-2 transition-none", selected.meta?.label ? "bg-violet-600 text-white hover:bg-violet-700 hover:text-white" : "bg-transparent")}>
                <LinkIcon size={14} />
                <span>Placeholder</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" sideOffset={6}>
              {placeholders.map((placeholder) => (
                <DropdownMenuCheckboxItem
                  className="text-xs"
                  key={placeholder.value}
                  checked={selected.meta?.label === placeholder.value}
                  onCheckedChange={(value) => editor.canvas.onMarkActiveObjectAsPlaceholder(!value ? false : placeholder.value)}
                >
                  {placeholder.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
      <div className="flex items-center gap-1 p-1">
        <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7" onClick={() => editor.canvas.cloner.clone()} disabled={selected.meta?.thumbnail}>
          <CopyPlusIcon size={14} />
        </Button>
        <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7" onClick={() => editor.canvas.onDeleteActiveObject()}>
          <Trash2Icon size={14} />
        </Button>
      </div>
      <div className="flex items-center gap-1 p-1">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-sm h-7 w-7">
              <SendToBackIcon size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-40" align="end" sideOffset={6} alignOffset={-4}>
            <DropdownMenuLabel className="text-xs">Move</DropdownMenuLabel>
            <DropdownMenuGroup>
              {move.map(({ label, value }) => (
                <DropdownMenuItem key={value} onClick={() => editor.canvas.alignment.changeActiveObjectLayer(value)} className="text-xs">
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Align to Page</DropdownMenuLabel>
            <DropdownMenuGroup>
              {align.map(({ label, value }) => (
                <DropdownMenuItem key={value} onClick={() => editor.canvas.alignment.alignActiveObjecToPage(value)} className="text-xs">
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export const EditorElementControls = observer(_EditorElementControls);
const EditorElementControlsBase = observer(_EditorElementControlsBase);
