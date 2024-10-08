import { observer } from "mobx-react";

import { Separator } from "@/components/ui/separator";

import { ToolbarFillOption } from "../common/fill";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarOpacityOption } from "../common/opacity";

function _ShapeToolbar() {
  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <ToolbarFillOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarOpacityOption />
      <Separator orientation="vertical" className="h-8 mr-4" />
      <ToolbarTimelineOption />
    </div>
  );
}

export const ShapeToolbar = observer(_ShapeToolbar);
