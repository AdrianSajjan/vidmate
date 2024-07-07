import { ChevronUpIcon, GanttChartIcon, PauseIcon, PlayIcon, RepeatIcon, TimerIcon } from "lucide-react";
import { observer } from "mobx-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";
import { formatVideoDuration } from "@/lib/time";

import { EditorTimeline } from "./components/timeline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { presetDurations } from "@/constants/editor";
import { Toggle } from "@/components/ui/toggle";

function _EditorFooter() {
  const editor = useEditorContext();

  return (
    <motion.footer initial={{ height: 64 }} animate={{ height: editor.isTimelineOpen ? 288 : 64 }} className="flex flex-col bg-card dark:bg-gray-900/40 border-t shrink-0 overflow-hidden">
      <div className="h-16 px-4 flex items-center gap-12 justify-between border-b shrink-0 overflow-x-scroll">
        <div className="flex gap-px">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-1.5 rounded-r-none" disabled={editor.canvas.playing}>
                <TimerIcon size={15} />
                <span>Duration</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="pt-2 pb-3 px-3" align="start" side="top">
              <Label className="text-xs font-medium">Duration (s)</Label>
              <div className="flex items-center justify-between gap-4">
                <Slider disabled={editor.canvas.playing} min={5} max={60} value={[editor.canvas.duration / 1000]} onValueChange={([duration]) => editor.canvas.onChangeDuration(duration)} />
                <Input
                  autoFocus
                  type="number"
                  className="h-8 w-16 text-xs"
                  disabled={editor.canvas.playing}
                  value={editor.canvas.duration / 1000}
                  onChange={(event) => (+event.target.value < 5 || +event.target.value > 60 ? null : editor.canvas.onChangeDuration(+event.target.value))}
                />
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-l-none" disabled={editor.canvas.playing}>
                <ChevronUpIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-20" align="end" side="top">
              {presetDurations.map((duration) => (
                <DropdownMenuItem disabled={editor.canvas.playing} key={duration} className="text-xs pl-2.5" onClick={() => editor.canvas.onChangeDuration(duration)}>
                  {duration}s
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center">
          <div className="text-xs tabular-nums">
            <span>{formatVideoDuration(editor.canvas.seek)}</span>
            <span className="mx-1">/</span>
            <span>{formatVideoDuration(editor.canvas.duration)}</span>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-card dark:bg-secondary shadow-sm border h-11 w-11 ml-5 mr-3"
            variant="outline"
            onClick={() => (editor.canvas.playing ? editor.canvas.onPauseTimeline() : editor.canvas.onStartTimeline())}
          >
            {editor.canvas.playing ? <PauseIcon size={20} className="fill-foreground text-foreground" /> : <PlayIcon size={20} className="fill-foreground text-foreground" />}
          </Button>
          <Toggle
            pressed={editor.canvas.loop}
            disabled={editor.canvas.playing}
            onPressedChange={(loop) => editor.canvas.onToggleLoop(loop)}
            size="sm"
            value="repeat"
            aria-label="repeat"
            className="data-[state=on]:text-blue-600 data-[state=off]:text-gray-500 hover:bg-transparent data-[state=on]:bg-transparent"
          >
            <RepeatIcon size={14} />
          </Toggle>
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
