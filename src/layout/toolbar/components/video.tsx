import { observer } from "mobx-react";
import { BlendIcon, ClapperboardIcon, CropIcon, WandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { FabricUtils } from "@/fabric/utils";
import { useEditorContext } from "@/context/editor";

import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarPositionOption } from "../common/position";
import { ToolbarTimelineOption } from "../common/timeline";

function _VideoToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Video;

  const handleCropStart = () => {
    const video = editor.canvas.instance?.getItemByName(selected.name);
    if (!FabricUtils.isVideoElement(video)) return;
    if (video.clipPath) {
      editor.canvas.onModifyClipPathStart(video);
    } else {
      editor.canvas.onCropImageStart(video);
    }
  };

  const handleTrimStart = () => {
    const video = editor.canvas.instance?.getItemByName(selected.name);
    if (!FabricUtils.isVideoElement(video)) return;
    editor.canvas.onTrimVideoStart(video);
  };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-2.5">
        <Button onClick={handleTrimStart} variant="outline" size="sm" className="gap-1.5">
          <ClapperboardIcon size={15} />
          <span className="text-xs font-normal">Trim</span>
        </Button>
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
          className={cn("gap-1.5", editor.sidebarRight === "filters" ? "bg-card" : "bg-transparent", !selected.filters?.length ? "text-foreground" : "text-blue-600")}
        >
          <WandIcon size={15} />
          <span>Filters</span>
        </Button>
        <Button onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "clip" ? null : "clip")} size="sm" variant="outline" className="gap-1.5">
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

export const VideoToolbar = observer(_VideoToolbar);
