import { observer } from "mobx-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

function _ToolbarFillOption() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Object;

  const background = useMemo(() => {
    if (typeof selected.fill === "string") return selected.fill || "#000000";
    const gradient = (selected.fill as fabric.Gradient).colorStops!.map((stop) => `${stop.color} ${stop.offset * 100}%`).join(", ");
    return `linear-gradient(90deg, ${gradient})`;
  }, [selected.fill]);

  return (
    <div className="flex items-center gap-2.5">
      <Button
        onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "fill" ? null : "fill")}
        variant="outline"
        size="sm"
        className={cn("gap-1.5 px-2.5", editor.sidebarRight === "fill" ? "bg-card" : "bg-transparent")}
      >
        <div className="relative">
          <div className={cn("h-5 w-5 border rounded-full", !selected.fill ? "opacity-50" : "opacity-100")} style={{ background }} />
          {!selected.fill ? <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-card-foreground -rotate-45" /> : null}
        </div>
        <span className="text-xs font-normal">Fill</span>
      </Button>
    </div>
  );
}

export const ToolbarFillOption = observer(_ToolbarFillOption);
