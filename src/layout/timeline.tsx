import { Button } from "@/components/ui/button";
import { ChevronUpIcon, GanttChartIcon, PlayIcon, RepeatIcon, TimerIcon } from "lucide-react";

export function EditorTimeline() {
  return (
    <footer className="flex h-16 items-center justify-between px-4 bg-card dark:bg-gray-900/40 border-t shrink-0">
      <div>
        <div className="flex gap-px">
          <Button size="sm" variant="secondary" className="gap-1.5 rounded-r-none">
            <TimerIcon size={15} />
            <span>Duration</span>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-l-none">
            <ChevronUpIcon size={15} />
          </Button>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-xs">
          <span>00:16.5</span>
          <span className="mx-1">/</span>
          <span>00:18.0</span>
        </div>
        <Button size="icon" className="rounded-full bg-card dark:bg-secondary shadow-sm border h-11 w-11 ml-5 mr-3" variant="outline">
          <PlayIcon size={20} className="fill-foreground text-foreground" />
        </Button>
        <Button size="icon" variant="ghost">
          <RepeatIcon size={14} />
        </Button>
      </div>
      <div>
        <Button size="sm" variant="secondary" className="gap-1.5">
          <GanttChartIcon size={15} />
          <span>Timeline</span>
          <ChevronUpIcon size={15} />
        </Button>
      </div>
    </footer>
  );
}
