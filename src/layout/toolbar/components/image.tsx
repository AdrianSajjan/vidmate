import { observer } from "mobx-react";

import { Separator } from "@/components/ui/separator";

import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarAnimationOption } from "../common/animation";
import { ToolbarPositionOption } from "../common/position";

function _ImageToolbar() {
  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 ml-auto mr-4" />
      <ToolbarTimelineOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarAnimationOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const ImageToolbar = observer(_ImageToolbar);
