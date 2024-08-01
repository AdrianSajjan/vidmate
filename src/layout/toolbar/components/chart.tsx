import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorContext } from "@/context/editor";
import { ChartTypeRegistry } from "chart.js";
import { Radius, Waypoints } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const changeChartTypeOptions = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
];

function _ChartToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Chart;

  return (
    <div className="px-1 flex items-center gap-2 h-full w-full overflow-x-scroll scrollbar-hidden">
      <Select value="chartType" onValueChange={(value) => editor.canvas.chart.changeActiveChartType(value as keyof ChartTypeRegistry)}>
        <SelectTrigger className="h-8 text-xs w-40">
          <SelectValue>Chart Type</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {changeChartTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value="chartGridlines" onValueChange={(value) => editor.canvas.chart.toggleActiveChartGridlines(value)}>
        <SelectTrigger className="h-8 text-xs w-40">
          <SelectValue>Gridlines</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">Show X-Axis</SelectItem>
          <SelectItem value="y">Show Y-Axis</SelectItem>
          <SelectItem value="both">Show Both</SelectItem>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="outline" aria-label="border-radius" className="data-[state=open]:bg-card">
            <Radius size={15} />
          </Button>
        </PopoverTrigger>
        <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-2 pb-3 px-3" align="center">
          <Label className="text-xs font-medium">Border Radius</Label>
          <div className="flex items-center justify-between gap-4">
            <Slider min={0} max={100} value={[selected.chart.options?.elements?.bar?.borderRadius as number]} onValueChange={([radius]) => editor.canvas.chart.changeActiveChartBorderRadius(radius)} />
            <Input
              type="number"
              className="h-8 w-16 text-xs"
              value={selected.chart.options?.elements?.bar?.borderRadius as number}
              onChange={(event) => editor.canvas.chart.changeActiveChartBorderRadius(Number(event.target.value))}
            />
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button disabled={selected.chart.type !== "line"} size="icon" variant="outline" aria-label="point-radius" className="data-[state=open]:bg-card">
            <Waypoints size={15} />
          </Button>
        </PopoverTrigger>
        <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-2 pb-3 px-3" align="center">
          <Label className="text-xs font-medium">Point Radius</Label>
          <div className="flex items-center justify-between gap-4">
            <Slider min={2} max={100} value={[selected.chart.options?.elements?.point?.radius as number]} onValueChange={([radius]) => editor.canvas.chart.changeActiveChartPointRadius(radius)} />
            <Input
              type="number"
              className="h-8 w-16 text-xs"
              value={selected.chart.options?.elements?.point?.radius as number}
              onChange={(event) => editor.canvas.chart.changeActiveChartPointRadius(Number(event.target.value))}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const ChartToolbar = observer(_ChartToolbar);
