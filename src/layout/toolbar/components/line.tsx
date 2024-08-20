import { observer } from "mobx-react";

import { Separator } from "@/components/ui/separator";

import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarOpacityOption } from "../common/opacity";

function _LineToolbar() {
  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarOpacityOption />
      <Separator orientation="vertical" className="h-8 mr-4" />
      <ToolbarTimelineOption />
    </div>
  );
}

export const LineToolbar = observer(_LineToolbar);
