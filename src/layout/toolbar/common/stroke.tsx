import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react";
import { Slider } from "@/components/ui/slider";

function _ToolbarStrokeOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Object;

  return (
    <div className="flex items-center gap-2.5 mr-5">
      <Button
        onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "stroke" ? null : "stroke")}
        variant="outline"
        size="sm"
        className={cn("gap-1.5 px-2.5", editor.sidebarRight === "stroke" ? "bg-card" : "bg-transparent")}
      >
        <div className="relative">
          <div className={cn("h-5 w-5 border rounded-full grid place-items-center", !selected.stroke ? "opacity-50" : "opacity-100")} style={{ backgroundColor: !selected.stroke ? "#000000" : selected.stroke }}>
            <div className="h-2 w-2 rounded-full bg-white border" />
          </div>
          {!selected.stroke ? <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-card-foreground -rotate-45" /> : null}
        </div>
        <span className="text-xs font-normal">Stroke</span>
      </Button>
      {selected.stroke ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="pr-2">
              <span className="flex flex-col gap-0.5">
                <span className="h-[1px] w-4 bg-foreground/40" />
                <span className="h-[2px] w-4 bg-foreground/60" />
                <span className="h-[3px] w-4 bg-foreground/80" />
                <span />
              </span>
              <span className="text-xs mx-2 text-start tabular-nums">{selected.strokeWidth} px</span>
              <ChevronDownIcon size={15} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="pt-2 pb-3 px-3" align="start">
            <Label className="text-xs font-medium">Stroke Width</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={1} max={100} value={[selected.strokeWidth!]} onValueChange={([strokeWidth]) => editor.canvas.onChangeActiveObjectProperty("strokeWidth", strokeWidth)} />
              <Input
                autoFocus
                type="number"
                className="h-8 w-16 text-xs"
                value={selected.strokeWidth}
                onChange={(event) => (+event.target.value > 0 ? editor.canvas.onChangeActiveObjectProperty("strokeWidth", +event.target.value) : null)}
              />
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}

export const ToolbarStrokeOption = observer(_ToolbarStrokeOption);
