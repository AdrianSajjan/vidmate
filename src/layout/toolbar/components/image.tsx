import { observer } from "mobx-react";
import { BlendIcon, CropIcon, WandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useEditorContext } from "@/context/editor";

import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarOpacityOption } from "../common/opacity";

function _ImageToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Image;

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-2.5">
        <Button onClick={() => editor.canvas.cropper.cropActiveObject()} variant="outline" size="sm" className="gap-1.5">
          <CropIcon size={15} />
          <span className="text-xs font-normal">Crop</span>
        </Button>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarOpacityOption />
      <Separator orientation="vertical" className="h-8 mr-4" />
      <div className="flex items-center gap-4">
        <Button
          onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "filters" ? null : "filters")}
          size="sm"
          variant="outline"
          className={cn("gap-1.5", editor.sidebarRight === "filters" ? "bg-card" : "bg-transparent", !selected.filters?.length ? "text-foreground" : "text-primary")}
        >
          <WandIcon size={15} />
          <span>Filters</span>
        </Button>
        <Button
          onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "clip" ? null : "clip")}
          size="sm"
          variant="outline"
          className={cn("gap-1.5", editor.sidebarRight === "clip" ? "bg-card" : "bg-transparent", !selected.clipPath ? "text-foreground" : "text-primary")}
        >
          <BlendIcon size={15} />
          <span>Clip Mask</span>
        </Button>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarTimelineOption />
    </div>
  );
}

export const ImageToolbar = observer(_ImageToolbar);
