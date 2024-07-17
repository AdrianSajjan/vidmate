import { CheckIcon, CornerUpLeftIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditorContext } from "@/context/editor";

function _CropToolbar() {
  const editor = useEditorContext();
  const cropper = editor.canvas.cropper;

  const handleCropEnd = () => {
    editor.canvas.instance.discardActiveObject();
    editor.canvas.instance.setActiveObject(cropper.active!);
  };

  const handleFlipImage = (property: "flipX" | "flipY") => {
    editor.canvas.onChangeImageProperty(cropper.active!, property, !cropper.active![property]);
  };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <Button size="sm" className="gap-1.5 pl-2.5 bg-primary hover:bg-primary/90" onClick={handleCropEnd}>
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
