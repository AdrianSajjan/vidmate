import { observer } from "mobx-react";
import { BlendIcon, CropIcon, Settings2Icon, WandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditorContext } from "@/context/editor";

import { ToolbarAnimationOption } from "../common/animation";
import { ToolbarPositionOption } from "../common/position";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";

function _ImageToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Image;

  const handleCropStart = () => {
    const image = editor.canvas.instance?.getItemByName(selected.name) as fabric.Image;
    if (!image) return;
    editor.canvas.onCropImageStart(image);
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
        <Button size="sm" variant="outline" className="gap-1.5">
          <BlendIcon size={15} />
          <span>Filters</span>
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Settings2Icon size={15} />
          <span>Adjustments</span>
        </Button>
        <Button onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "clip" ? null : "clip")} size="sm" variant="outline" className="gap-1.5">
          <WandIcon size={15} />
          <span>Clip Mask</span>
        </Button>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarAnimationOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarTimelineOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const ImageToolbar = observer(_ImageToolbar);
