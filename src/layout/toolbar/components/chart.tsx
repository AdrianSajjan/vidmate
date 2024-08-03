import { observer } from "mobx-react";

import { EditChartModal } from "@/components/modal/edit-chart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorContext } from "@/context/editor";
import { ChartTypeRegistry } from "chart.js";
import { useState } from "react";

const changeChartTypeOptions = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
];

function _ChartToolbar() {
  const editor = useEditorContext();
  const [isOpen, setOpen] = useState(false);
  const [isLabelsOpen, setLabelsOpen] = useState(false);

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
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Chart Options
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-6xl">
          <DialogTitle className="sr-only">Edit Chart</DialogTitle>
          <DialogDescription className="sr-only">Edit the selected chart configuration</DialogDescription>
          <EditChartModal onClose={() => setOpen(false)} type="options" />
        </DialogContent>
      </Dialog>
      <Dialog open={isLabelsOpen} onOpenChange={setLabelsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Chart Labels
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-6xl">
          <DialogTitle className="sr-only">Edit Chart Labels</DialogTitle>
          <DialogDescription className="sr-only">Edit the selected chart labels</DialogDescription>
          <EditChartModal onClose={() => setLabelsOpen(false)} type="data" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const ChartToolbar = observer(_ChartToolbar);
