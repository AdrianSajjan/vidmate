import { EclipseIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useEditorContext } from "@/context/editor";

function _ToolbarOpacityOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Object;

  return (
    <div className="flex items-center gap-4 mr-5">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="data-[state=open]:bg-card">
            <EclipseIcon size={15} />
            <span className="ml-1.5">Opacity</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-3 pb-3 px-3" align="end">
          <Label className="text-xs font-medium">Opacity (%)</Label>
          <div className="flex items-center justify-between gap-4">
            <Slider min={0} max={100} value={[selected.opacity! * 100]} onValueChange={([opacity]) => editor.canvas.onChangeActiveObjectProperty("opacity", opacity / 100)} />
            <Input
              type="number"
              className="h-8 w-20 text-xs"
              value={Math.round(selected.opacity! * 100)}
              onChange={(event) => (+event.target.value > 0 ? editor.canvas.onChangeActiveObjectProperty("opacity", +event.target.value / 100) : null)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const ToolbarOpacityOption = observer(_ToolbarOpacityOption);
