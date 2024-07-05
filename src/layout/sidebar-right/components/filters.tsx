import { EyeIcon, EyeOff, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { HTMLAttributes, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";
import { Label } from "@/components/ui/label";
import { FilterSlider } from "@/components/slider/filter";

import { useEditorContext } from "@/context/editor";
import { filters, Filter, adjustments, Adjustment } from "@/fabric/filters";
import { filterPlaceholder } from "@/constants/editor";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

function _FilterSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Image | null;

  useEffect(() => {
    if (!selected || !(selected.type === "image" || selected.type === "video")) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const handleToggleFilter = (filter: Filter) => {
    if (selected?.effects?.name === filter.name) {
      editor.canvas.onRemoveFilterFromActiveImage(filter.name);
    } else {
      editor.canvas.onAddFilterToActiveImage(filter.filter(50), filter.name, 50);
    }
  };

  const handleModifyFilter = (filter: Filter, intensity: number) => {
    editor.canvas.onAddFilterToActiveImage(filter.filter(intensity), filter.name, intensity);
  };

  const handleToggleAdjustment = (adjustment: Adjustment, active: boolean) => {
    if (active) {
      editor.canvas.onApplyAdjustmentToActiveImage(adjustment.filter(0), adjustment.name, 0);
    } else {
      editor.canvas.onRemoveAdjustmentFromActiveImage(adjustment.name);
    }
  };

  const handleModifyAdjustment = (adjustment: Adjustment, intensity: number) => {
    editor.canvas.onApplyAdjustmentToActiveImage(adjustment.filter(intensity), adjustment.name, intensity);
  };

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Filters</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container px-4 py-4">
        <Tabs defaultValue="effects">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="effects" className="text-xs h-full">
              Effects
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="text-xs h-full">
              Adjustments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="effects" className="mt-0 pt-3.5">
            <div className="flex flex-col gap-3">
              {filters.map((filter) => (
                <FilterItem key={filter.name} filter={filter} selected={selected} onChange={(intensity) => handleModifyFilter(filter, intensity)} onClick={() => handleToggleFilter(filter)} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="adjustments" className="mt-0 pt-5">
            <div className="flex flex-col gap-4">
              {adjustments.map((adjustment) => (
                <AdjustmentItem
                  key={adjustment.name}
                  adjustment={adjustment}
                  selected={selected}
                  onChange={(intensity) => handleModifyAdjustment(adjustment, intensity)}
                  onToggle={(active) => handleToggleAdjustment(adjustment, active)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

interface FilterItemProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
  filter: Filter;
  selected: fabric.Image | null;
  onChange: (value: number) => void;
}

function _FilterItem({ filter, selected, className, onChange, ...props }: FilterItemProps) {
  const active = selected?.effects?.name === filter.name;
  const intensity = selected?.effects?.intensity || 50;

  if (!active) {
    return (
      <button className={cn("h-14 w-full relative rounded-md overflow-hidden group", className)} {...props}>
        <img src={filterPlaceholder} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card-foreground" />
        <span className="absolute bottom-1.5 left-2.5 text-card text-xs font-medium">{filter.name}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button className={cn("h-14 w-full relative rounded-md overflow-hidden group ring ring-blue-500", className)} {...props}>
        <img src={filterPlaceholder} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card-foreground" />
        <span className="absolute bottom-1 left-2 text-card text-xs font-medium">{filter.name}</span>
      </button>
      <div className="flex items-center justify-between gap-10">
        <Label className="text-xs font-medium">Intensity</Label>
        <FilterSlider min={1} max={100} step={1} value={[intensity]} onValueChange={([intensity]) => onChange(intensity)} />
      </div>
    </div>
  );
}

interface AdjustmentItemProps {
  adjustment: Adjustment;
  selected: fabric.Image | null;
  onChange: (value: number) => void;
  onToggle: (value: boolean) => void;
}

function _AdjustmentItem({ adjustment, selected, onChange, onToggle }: AdjustmentItemProps) {
  const active = !!selected?.adjustments?.[adjustment.name];
  const intensity = selected?.adjustments?.[adjustment.name]?.intensity || 0;

  return (
    <div className={cn("items-center grid grid-cols-12", active ? "opacity-100" : "opacity-50")}>
      <Label className="text-xs font-medium col-span-5">{adjustment.name}</Label>
      <div className="flex items-center col-span-7 gap-2">
        <Toggle className="h-6 w-6 px-0 text-foreground shrink-0" pressed={active} onPressedChange={onToggle}>
          {active ? <EyeIcon size={12} /> : <EyeOff size={12} />}
        </Toggle>
        <FilterSlider disabled={!active} min={-100} max={100} step={1} value={[intensity]} onValueChange={([intensity]) => onChange(intensity)} />
      </div>
    </div>
  );
}

const FilterItem = observer(_FilterItem);
const AdjustmentItem = observer(_AdjustmentItem);
export const FilterSidebar = observer(_FilterSidebar);
