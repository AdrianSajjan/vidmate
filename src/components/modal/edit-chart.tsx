import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { Chart } from "chart.js";
import { useEditorContext } from "@/context/editor";
import { colorToHex, getChartGridlinesStatus } from "@/lib/charts";
import { createInstance } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

function _EditChartModal({ onClose, type }: { onClose: () => void; type: "options" | "data" }) {
  return (
    <>
      {(() => {
        switch (type) {
          case "options":
            return <EditChartOptionsModal onClose={onClose} />;
          case "data":
            return <EditChartLabelsModal onClose={onClose} />;
          default:
            return null;
        }
      })()}
    </>
  );
}

function _EditChartOptionsModal({ onClose }: { onClose: () => void }) {
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
    editor.canvas.chart.updateActiveChartOptions(options);
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
        <div className="flex flex-row gap-4">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" className="flex-1 text-xs bg-primary hover:bg-primary/90" onClick={onSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function _EditChartLabelsModal({ onClose }: { onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Chart;
  const [chart, setChart] = useState<Chart>();
  const [labels, setLabels] = useState<string[]>([]);
  const [labelData, setLabelData] = useState<number[]>([]);
  const [labelBg, setLabelBg] = useState<string[]>([]);
  const [chartTitle, setChartTitle] = useState(selected.chart.data.datasets[0].label || "");

  useEffect(() => {
    if (!canvas.current || chart) return;
    const _chart = createInstance(Chart, canvas.current, toJS(selected.chart));
    setChart(_chart);
    setLabels(_chart.data.labels as string[]);
    setLabelData(_chart.data.datasets[0].data as number[]);
    setLabelBg(_chart.data.datasets[0].backgroundColor as string[]);
    return () => {
      _chart.destroy();
    };
  }, [selected.chart, canvas.current]);

  const updateChartTitle = (title: string) => {
    if (!chart) return;
    chart.data.datasets[0].label = title;
    chart.update("none");
    setChart(chart);
    setChartTitle(title);
  };

  const addChartLabelData = () => {
    if (!chart) return;
    setLabels([...labels, "Label"]);
    setLabelData([...labelData, 0]);
    setLabelBg([...labelBg, "gray"]);
  };

  const removeChartLabelData = (index: number) => {
    if (!chart) return;
    const _labels = labels.filter((_, i) => i !== index);
    const _labelData = labelData.filter((_, i) => i !== index);
    const _labelBg = labelBg.filter((_, i) => i !== index);

    chart.data.labels = _labels;
    chart.data.datasets[0].data = _labelData;
    chart.data.datasets[0].backgroundColor = _labelBg;

    chart.update("none");
    setChart(chart);
    setLabels(_labels);
    setLabelData(_labelData);
    setLabelBg(_labelBg);
  };

  const onSaveChanges = () => {
    if (!chart) return;
    const data = {
      labels: labels,
      datasets: [
        {
          label: chartTitle ? chartTitle : "Title",
          data: labelData,
          backgroundColor: labelBg,
        },
      ],
    };
    editor.canvas.chart.updateActiveChartLabels(data);
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
          <label className="text-xs font-semibold">Edit Chart Data</label>
          <div className="flex flex-col px-2.5 pt-3.5 gap-3">
            <div className="grid grid-cols-12 items-center">
              <Label className="text-xs col-span-3">Chart Title</Label>
              <Input type="text" className="h-8 col-span-9 text-xs" value={chartTitle} onChange={(event) => updateChartTitle(event.target.value)} />
            </div>
            <div className="grid grid-cols-12 items-start">
              <Label className="text-xs col-span-12 mb-2">Chart Data</Label>
              <div className="col-span-12 flex flex-col gap-3">
                {labels.map((label, index) => (
                  <div key={index} className="flex items-center gap-4 justify-between">
                    <Input type="text" className="h-8 text-xs" value={label} onChange={(event) => setLabels(labels.map((item, i) => (i === index ? event.target.value : item)))} />
                    <Input type="number" className="h-8 text-xs" value={labelData[index]} onChange={(event) => setLabelData(labelData.map((item, i) => (i === index ? Number(event.target.value) : item)))} />
                    <Input type="color" className="h-8 text-xs" value={colorToHex(labelBg[index])} onChange={(event) => setLabelBg(labelBg.map((item, i) => (i === index ? event.target.value : item)))} />
                    <Button disabled={labels.length <= 1} variant="ghost" className="text-xs h-8 hover:bg-red-50 hover:text-red-500" onClick={() => removeChartLabelData(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="text-xs h-8" onClick={addChartLabelData}>
                  Add Label
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" className="flex-1 text-xs bg-primary hover:bg-primary/90" onClick={onSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export const EditChartOptionsModal = observer(_EditChartOptionsModal);
export const EditChartLabelsModal = observer(_EditChartLabelsModal);
export const EditChartModal = observer(_EditChartModal);
