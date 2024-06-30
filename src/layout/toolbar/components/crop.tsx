import { CheckIcon, CornerUpLeftIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditorContext } from "@/context/editor";

function _CropToolbar() {
  const editor = useEditorContext();
  const crop = editor.canvas.crop;

  const handleCropEnd = () => {
    const image = editor.canvas.instance?.getItemByName(crop?.name);
    editor.canvas.instance?.discardActiveObject();
    if (image) editor.canvas.instance?.setActiveObject(image);
  };

  const handleFlipImage = (property: "flipX" | "flipY") => {
    const image = editor.canvas.instance?.getItemByName(crop?.name) as fabric.Image;
    if (!image) return;
    editor.canvas.onChangeImageProperty(image, property, !image[property]);
  };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <Button size="sm" className="gap-1.5 pl-2.5 bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90" onClick={handleCropEnd}>
        <CheckIcon size={15} />
        <span>Done</span>
      </Button>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <div className="flex items-center gap-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => handleFlipImage("flipX")}>
              <FlipHorizontal2Icon size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Mirror image horizontally
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => handleFlipImage("flipY")}>
              <FlipVertical2Icon size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Mirror image vertically
          </TooltipContent>
        </Tooltip>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <Button variant="outline" size="sm" className="gap-1.5">
        <CornerUpLeftIcon size={15} />
        <span>Reset</span>
      </Button>
    </div>
  );
}

export const CropToolbar = observer(_CropToolbar);
