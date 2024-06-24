import { ChevronUpIcon, GanttChartIcon, PlayIcon, RepeatIcon, TimerIcon } from "lucide-react";
import { observer } from "mobx-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";

function _EditorTimeline() {
  const editor = useEditorContext();

  return (
    <motion.footer animate={{ height: editor.isTimelineOpen ? 288 : 64 }} className="flex flex-col bg-card dark:bg-gray-900/40 border-t shrink-0 overflow-hidden">
      <div className="h-16 px-4 flex items-center justify-between border-b shrink-0">
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
          <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => editor.onToggleTimeline()}>
            <GanttChartIcon size={15} />
            <span>Timeline</span>
            <motion.span animate={{ rotate: editor.isTimelineOpen ? 180 : 0 }}>
              <ChevronUpIcon size={15} />
            </motion.span>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-background shrink overflow-x-scroll relative">
        <div className="h-8 absolute bg-card/40 dark:bg-gray-900/40" style={{ width: 100 * 64 }} />
        <div className="h-8 absolute bg-card dark:bg-gray-900" style={{ width: 18 * 64, transform: "translateX(24px)" }} />
        <div className="h-8 absolute inset-0 flex items-center">
          <span className="text-xxs shrink-0" style={{ width: 24 }} />
          {Array.from({ length: 100 }, (_, index) => {
            if (index === 0 || index % 4 === 0)
              return (
                <span key={index} className="text-xxs shrink-0" style={{ width: 64 }}>
                  {index}s
                </span>
              );
            return (
              <span className="shrink-0 text-gray-400" style={{ width: 64 }}>
                •
              </span>
            );
          })}
        </div>
      </div>
    </motion.footer>
  );
}

export const EditorTimeline = observer(_EditorTimeline);
