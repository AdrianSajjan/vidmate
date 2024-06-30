import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

export function ToolbarStrokeOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Object;

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
              <span className="text-xs mx-2 text-start">{selected.strokeWidth} px</span>
              <ChevronDownIcon size={15} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 py-2 pr-2 pl-3" align="start">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Stroke Width</Label>
              <div className="relative">
                <Input
                  autoFocus
                  className="h-8 w-24 text-xs pr-7"
                  type="number"
                  value={selected.strokeWidth}
                  onChange={(event) => !isNaN(+event.target.value) && editor.canvas.onChangeActiveObjectProperty("strokeWidth", +event.target.value)}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">px</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
