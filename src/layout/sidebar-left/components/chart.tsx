import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/editor";

import bar from "@/assets/editor/charts/bar.svg";

function _ChartSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Chart</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container pb-4">
        <div className="px-3 pt-4 pb-6">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
        </div>
        <div className="px-3 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold line-clamp-1">Basic Charts</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={() => editor.canvas.chart.add("bar")}
                  className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <img src={bar} alt="bar-chart" />
                </button>
                <span className="text-xxs text-center font-medium w-20 px-1 mx-auto whitespace-nowrap overflow-hidden text-ellipsis">Bar Chart</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={() => editor.canvas.chart.add("line")}
                  className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <img src={bar} alt="line-chart" />
                </button>
                <span className="text-xxs text-center font-medium w-20 px-1 mx-auto whitespace-nowrap overflow-hidden text-ellipsis">Line Chart</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={() => editor.canvas.chart.add("pie")}
                  className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <img src={bar} alt="pie-chart" />
                </button>
                <span className="text-xxs text-center font-medium w-20 px-1 mx-auto whitespace-nowrap overflow-hidden text-ellipsis">Pie Chart</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const ChartSidebar = observer(_ChartSidebar);
