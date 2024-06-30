import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorContext } from "@/context/editor";
import { observer } from "mobx-react";

function _ToolbarTimelineOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Object;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-gray-700">Timeline</Label>
        <div className="relative">
          <Input
            type="number"
            value={selected.meta ? selected.meta.duration / 1000 : 0}
            onChange={(event) => !isNaN(+event.target.value) && +event.target.value > 0 && editor.canvas.onChangeActiveObjectTimelineProperty("duration", +event.target.value * 1000)}
            className="h-8 w-24 text-xs pr-7"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">s</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-gray-700">Offset</Label>
        <div className="relative">
          <Input
            type="number"
            value={selected.meta ? selected.meta.offset / 1000 : 0}
            onChange={(event) => !isNaN(+event.target.value) && +event.target.value >= 0 && editor.canvas.onChangeActiveObjectTimelineProperty("offset", +event.target.value * 1000)}
            className="h-8 w-24 text-xs pr-7"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">s</span>
        </div>
      </div>
    </div>
  );
}

export const ToolbarTimelineOption = observer(_ToolbarTimelineOption);
