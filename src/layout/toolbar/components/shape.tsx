import { observer } from "mobx-react";

import { Separator } from "@/components/ui/separator";

import { ToolbarFillOption } from "../common/fill";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarPositionOption } from "../common/position";

function _ShapeToolbar() {
  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <ToolbarFillOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 ml-auto mr-4" />
      <ToolbarTimelineOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const ShapeToolbar = observer(_ShapeToolbar);
