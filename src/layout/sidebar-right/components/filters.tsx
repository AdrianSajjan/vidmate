import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { HTMLAttributes, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";

import { useEditorContext } from "@/context/editor";
import { filters, Filter } from "@/fabric/filters";
import { filterPlaceholder } from "@/constants/editor";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function _FilterSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Image | null;

  useEffect(() => {
    if (!selected || selected.type !== "image") editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const handleApplyFilter = (filter: Filter, intensity = 50) => {
    editor.canvas.onAddFilterToActiveImage(filter.filter(), filter.name, intensity);
  };

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Filters</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-4 py-4 flex flex-col gap-3">
          {filters.map((filter) => (
            <FilterItem key={filter.name} filter={filter} active={selected?.effects?.name === filter.name} onChange={(intensity) => handleApplyFilter(filter, intensity)} onClick={() => handleApplyFilter(filter)} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface FilterItemProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
  filter: Filter;
  active: boolean;
  onChange: (value: number) => void;
}

function _FilterItem({ filter, active, className, onChange, ...props }: FilterItemProps) {
  if (!active) {
    return (
      <button className={cn("h-14 w-full relative rounded-md overflow-hidden group", className)} {...props}>
        <img src={filterPlaceholder} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card-foreground" />
        <span className="absolute bottom-1 left-2 text-card text-xs font-medium">{filter.name}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button className={cn("h-14 w-full relative rounded-md overflow-hidden group ring ring-blue-500", className)} {...props}>
        <img src={filterPlaceholder} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card-foreground" />
        <span className="absolute bottom-1 left-2 text-card text-xs font-medium">{filter.name}</span>
      </button>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Intensity</Label>
      </div>
    </div>
  );
}

const FilterItem = observer(_FilterItem);
export const FilterSidebar = observer(_FilterSidebar);
