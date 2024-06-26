import { ChevronUpIcon, GanttChartIcon, PauseIcon, PlayIcon, RepeatIcon, TimerIcon } from "lucide-react";
import { observer } from "mobx-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";
import { formatVideoDuration } from "@/lib/time";

import { EditorTimeline } from "./components/timeline";

function _EditorFooter() {
  const editor = useEditorContext();

  return (
    <motion.footer initial={{ height: 64 }} animate={{ height: editor.isTimelineOpen ? 288 : 64 }} className="flex flex-col bg-card dark:bg-gray-900/40 border-t shrink-0 overflow-hidden">
      <div className="h-16 px-4 flex items-center gap-12 justify-between border-b shrink-0 overflow-x-scroll">
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
          <div className="text-xs tabular-nums">
            <span>{formatVideoDuration(editor.canvas.seek)}</span>
            <span className="mx-1">/</span>
            <span>{formatVideoDuration(editor.canvas.duration)}</span>
          </div>
          <Button size="icon" className="rounded-full bg-card dark:bg-secondary shadow-sm border h-11 w-11 ml-5 mr-3" variant="outline" onClick={() => editor.canvas.onToggleTimeline()}>
            {editor.canvas.playing ? <PauseIcon size={20} className="fill-foreground text-foreground" /> : <PlayIcon size={20} className="fill-foreground text-foreground" />}
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
      <EditorTimeline />
    </motion.footer>
  );
}

export const EditorFooter = observer(_EditorFooter);
