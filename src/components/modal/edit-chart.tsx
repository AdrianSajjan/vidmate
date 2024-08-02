import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { Chart } from "chart.js";
import { useEditorContext } from "@/context/editor";
import { getChartGridlinesStatus } from "@/lib/charts";
import { createInstance } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

function _EditChartModal({ onClose }: { onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Chart;
  const [chart, setChart] = useState<Chart>();
  const [options, setOptions] = useState(() => toJS(selected.chart.options));

  useEffect(() => {
    if (!canvas.current || chart) return;
    const _chart = createInstance(Chart, canvas.current, toJS(selected.chart));
    setChart(_chart);
    return () => {
      _chart.destroy();
    };
  }, [selected.chart, canvas.current]);

  const toggleChartGrid = (value: string) => {
    if (!chart) return;
    chart.options.scales!.x!.grid!.display = value === "y" || value === "both";
    chart.options.scales!.y!.grid!.display = value === "x" || value === "both";
    chart.update("none");
    setOptions(chart.options);
  };

  const updateBarChartBorderRadius = (radius: number) => {
    if (!chart) return;
    chart.options.elements!.bar!.borderRadius = radius;
    chart.update("none");
    setOptions(chart.options);
  };

  const updateLineChartPointRadius = (radius: number) => {
    if (!chart) return;
    chart.options.elements!.point!.radius = radius;
    chart.update("none");
    setOptions(chart.options);
  };

  const updatePieChartCircular = (value: string) => {
    if (!chart) return;
    chart.options.elements!.arc!.circular = value === "true";
    chart.update("none");
    setOptions(JSON.parse(JSON.stringify(chart.options)));
  };

  const onSaveChanges = () => {
    if (!chart) return;
    editor.canvas.chart.updateActiveChart(options);
    onClose();
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-7">
        <div className="relative flex items-center justify-center h-64 sm:h-96 w-full py-4">
          <canvas ref={canvas} className="w-full h-full" />
        </div>
      </div>
      <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
        <div className="flex flex-col h-full">
          <label className="text-xs font-semibold">Edit Chart Options</label>
          <div className="flex flex-col px-2.5 pt-3.5 gap-3">
            <div className="grid grid-cols-12 items-center">
              <Label className="text-xs col-span-3">Chart Gridlines</Label>
              <Select value={getChartGridlinesStatus(options!.scales!)} onValueChange={(value) => toggleChartGrid(value)}>
                <SelectTrigger className="h-8 text-xs w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">X-Axis</SelectItem>
                  <SelectItem value="y">Y-Axis</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(() => {
              switch (selected.chart.type) {
                case "bar":
                  return (
                    <div className="grid grid-cols-12 items-center">
                      <Label className="text-xs col-span-3 font-medium">Border Radius</Label>
                      <div className="col-span-9 flex items-center justify-between gap-4">
                        <Slider min={0} max={100} value={[options?.elements?.bar?.borderRadius as number]} onValueChange={([radius]) => updateBarChartBorderRadius(radius)} />
                        <Input type="number" className="h-8 w-16 text-xs" value={options?.elements?.bar?.borderRadius as number} onChange={(event) => updateBarChartBorderRadius(Number(event.target.value))} />
                      </div>
                    </div>
                  );
                case "line":
                  return (
                    <div className="grid grid-cols-12 items-center">
                      <Label className="col-span-3 text-xs font-medium">Border Radius</Label>
                      <div className="col-span-9 flex items-center justify-between gap-4">
                        <Slider min={0} max={20} value={[options?.elements?.point?.radius as number]} onValueChange={([radius]) => updateLineChartPointRadius(radius)} />
                        <Input type="number" className="h-8 w-16 text-xs" value={options?.elements?.point?.radius as number} onChange={(event) => updateLineChartPointRadius(Number(event.target.value))} />
                      </div>
                    </div>
                  );
                case "pie":
                  return (
                    <div className="grid grid-cols-12 items-center">
                      <Label className="text-xs col-span-3">Circular Chart</Label>
                      <Select value={options?.elements?.arc?.circular ? "true" : "false"} onValueChange={(value) => updatePieChartCircular(value)}>
                        <SelectTrigger className="h-8 text-xs w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Circular</SelectItem>
                          <SelectItem value="false">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
              }
            })()}
          </div>
        </div>
        <div className="flex flex-row gap-4 self-end">
          <Button variant="default" className="text-xs bg-primary hover:bg-primary/90" onClick={onSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export const EditChartModal = observer(_EditChartModal);
