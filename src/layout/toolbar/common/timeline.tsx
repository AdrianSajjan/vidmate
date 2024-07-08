import { GanttChartIcon, LayersIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

function _ToolbarTimelineOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Object;

  return (
    <div className="flex items-center gap-4">
      <Button
        size="sm"
        variant="outline"
        onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "animations" ? null : "animations")}
        className={cn("gap-1.5", editor.sidebarRight === "animations" ? "bg-card" : "bg-transparent")}
      >
        <LayersIcon size={15} />
        <span>Animations</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5 data-[state=open]:bg-card">
            <GanttChartIcon size={15} />
            <span>Timeline</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="pt-3 pb-3 px-3" align="end">
          <Label className="text-xs font-medium">Duration (s)</Label>
          <div className="flex items-center justify-between gap-4">
            <Slider min={1} max={editor.canvas.duration / 1000} value={[selected.meta!.duration / 1000]} onValueChange={([duration]) => editor.canvas.onChangeActiveObjectTimelineProperty("duration", duration * 1000)} />
            <Input
              autoFocus
              step={0.5}
              type="number"
              className="h-8 w-20 text-xs"
              value={selected.meta!.duration / 1000}
              onChange={(event) => (+event.target.value > 0 ? editor.canvas.onChangeActiveObjectTimelineProperty("duration", +event.target.value * 1000) : null)}
            />
          </div>
          <Label className="text-xs font-medium">Offset (s)</Label>
          <div className="flex items-center justify-between gap-4">
            <Slider min={0} max={editor.canvas.duration / 1000} value={[selected.meta!.offset / 1000]} onValueChange={([offset]) => editor.canvas.onChangeActiveObjectTimelineProperty("offset", offset * 1000)} />
            <Input
              autoFocus
              step={0.5}
              type="number"
              className="h-8 w-20 text-xs"
              value={selected.meta!.offset / 1000}
              onChange={(event) => (+event.target.value >= 0 ? editor.canvas.onChangeActiveObjectTimelineProperty("offset", +event.target.value * 1000) : null)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const ToolbarTimelineOption = observer(_ToolbarTimelineOption);
