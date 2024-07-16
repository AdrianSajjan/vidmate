import { observer } from "mobx-react";
import { BlendIcon, CropIcon, WandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useEditorContext } from "@/context/editor";

import { ToolbarPositionOption } from "../common/position";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { FabricUtils } from "@/fabric/utils";

function _ImageToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Image;

  const handleCropStart = () => {
    const image = editor.canvas.instance?.getActiveObject();
    if (!FabricUtils.isImageElement(image)) return;
    editor.canvas.cropper.start(image);
  };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-2.5">
        <Button onClick={handleCropStart} variant="outline" size="sm" className="gap-1.5">
          <CropIcon size={15} />
          <span className="text-xs font-normal">Crop</span>
        </Button>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 ml-auto mr-4" />
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
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const ImageToolbar = observer(_ImageToolbar);
