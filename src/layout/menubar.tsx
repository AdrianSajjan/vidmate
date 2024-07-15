import { ChevronDownIcon, ImageIcon, RedoIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { observer } from "mobx-react";
import { flowResult } from "mobx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleTheme } from "@/components/ui/theme-toggle";

import { useEditorContext } from "@/context/editor";
import { createFileDownload } from "@/lib/utils";
import { fetchExtensionByCodec } from "@/constants/recorder";

function _EditorMenubar() {
  const editor = useEditorContext();
  const codec = fetchExtensionByCodec(editor.codec);

  const handleExportVideo = async () => {
    try {
      editor.onTogglePreviewModal("open");
      const blob = await flowResult(editor.onExportVideo());
      const file = (editor.file || "output") + "." + codec.extension;
      createFileDownload(blob, file);
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to export video");
    }
  };

  if (!editor.canvas.workspace || !editor.canvas.history) return null;

  return (
    <header className="flex h-14 items-center px-3 bg-card dark:bg-gray-900/40 border-b shrink-0">
      <section id="left" className="flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="sm" className="gap-1.5 rounded-r-none" onClick={() => editor.canvas.history.undo()} disabled={!editor.canvas.history.canUndo}>
            <UndoIcon size={15} />
            <span className="font-medium">Undo</span>
          </Button>
          <Button variant="secondary" size="icon" className="rounded-l-none" onClick={() => editor.canvas.history.redo()} disabled={!editor.canvas.history.canRedo}>
            <RedoIcon size={15} />
          </Button>
        </div>
      </section>
      <section id="right" className="ml-auto flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="icon" className="rounded-r-none" onClick={() => editor.canvas.workspace.onChangeZoom(editor.canvas.workspace.zoom - 0.05)}>
            <ZoomOutIcon size={15} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-none gap-1.5 justify-between w-32">
                <span className="font-medium">{Math.round(editor.canvas.workspace.zoom * 100)}%</span>
                <ChevronDownIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-32">
              <DropdownMenuGroup>
                {[25, 50, 75, 100, 125, 150, 175, 200].map((percentage) => (
                  <DropdownMenuItem key={percentage} className="text-xs" onClick={() => editor.canvas.workspace.onChangeZoom(percentage / 100)}>
                    {percentage}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="icon" className="rounded-l-none" onClick={() => editor.canvas.workspace.onChangeZoom(editor.canvas.workspace.zoom + 0.05)}>
            <ZoomInIcon size={16} />
          </Button>
        </div>
        <div className="flex gap-px">
          <Button size="sm" className="gap-2 rounded-r-none bg-primary hover:bg-primary/90 w-36" onClick={() => handleExportVideo()}>
            <ImageIcon size={15} />
            <span className="font-medium">Export Video</span>
          </Button>
          <Button size="icon" className="rounded-l-none bg-primary hover:bg-primary/90" onClick={() => editor.onTogglePreviewModal("open")}>
            <ChevronDownIcon size={15} />
          </Button>
        </div>
        <ToggleTheme />
      </section>
    </header>
  );
}

export const EditorMenubar = observer(_EditorMenubar);
