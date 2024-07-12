import { ChevronDownIcon, ImageIcon, RedoIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { observer } from "mobx-react";
import { flowResult } from "mobx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleTheme } from "@/components/ui/theme-toggle";
import { useEditorContext } from "@/context/editor";

function _EditorMenubar() {
  const editor = useEditorContext();

  const handleExportVideo = async (fps?: number) => {
    try {
      editor.onTogglePreviewModal("open");
      await flowResult(editor.onExportVideo({ fps }));
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to export video");
    }
  };

  return (
    <header className="flex h-14 items-center px-3 bg-card dark:bg-gray-900/40 border-b shrink-0">
      <section id="left" className="flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="sm" className="gap-1.5 rounded-r-none">
            <UndoIcon size={15} />
            <span className="font-medium">Undo</span>
          </Button>
          <Button variant="secondary" size="icon" className="rounded-l-none">
            <RedoIcon size={15} />
          </Button>
        </div>
      </section>
      <section id="right" className="ml-auto flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="icon" className="rounded-r-none" onClick={() => editor.canvas.onChangeZoom(editor.canvas.zoom - 0.05)}>
            <ZoomOutIcon size={15} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-none gap-1.5 justify-between w-32">
                <span className="font-medium">{Math.round(editor.canvas.zoom * 100)}%</span>
                <ChevronDownIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-32">
              <DropdownMenuGroup>
                {[25, 50, 75, 100, 125, 150, 175, 200].map((percentage) => (
                  <DropdownMenuItem key={percentage} className="text-xs" onClick={() => editor.canvas.onChangeZoom(percentage / 100)}>
                    {percentage}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="icon" className="rounded-l-none" onClick={() => editor.canvas.onChangeZoom(editor.canvas.zoom + 0.05)}>
            <ZoomInIcon size={16} />
          </Button>
        </div>
        <div className="flex gap-px">
          <Button size="sm" className="gap-2 rounded-r-none bg-primary hover:bg-primary/90" onClick={() => handleExportVideo()}>
            <ImageIcon size={15} />
            <span className="font-medium">Export Template</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-l-none bg-primary hover:bg-primary/90">
                <ChevronDownIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem className="text-xs h-8 font-medium" onClick={() => handleExportVideo(24)}>
                Export Video - 24FPS
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs h-8 font-medium" onClick={() => handleExportVideo(30)}>
                Export Video - 30FPS
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs h-8 font-medium" onClick={() => handleExportVideo(60)}>
                Export Video - 60FPS
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs h-8 font-medium" disabled={!editor.blob} onClick={() => editor.onTogglePreviewModal("open")}>
                Exported Video Preview
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ToggleTheme />
      </section>
    </header>
  );
}

export const EditorMenubar = observer(_EditorMenubar);
