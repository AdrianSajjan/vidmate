import { ChevronUpIcon, GanttChartIcon, PauseIcon, PlayIcon, TimerIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

import { useIsTablet } from "@/hooks/use-media-query";
import { useEditorContext } from "@/context/editor";
import { formatMediaDuration } from "@/lib/time";
import { presetDurations } from "@/constants/editor";
import { cn } from "@/lib/utils";

function _EditorPlayback() {
  const editor = useEditorContext();
  const isTablet = useIsTablet();

  return (
    <div className="h-14 sm:h-16 px-4 flex items-center gap-8 justify-between border-b shrink-0 overflow-x-scroll scrollbar-hidden">
      <div className="flex gap-px">
        <Popover>
          <PopoverTrigger asChild>
            {isTablet ? (
              <Button size="sm" variant="secondary" className="gap-1.5 rounded-r-none" disabled={editor.canvas.timeline.playing}>
                <TimerIcon size={15} />
                <span>Duration</span>
              </Button>
            ) : (
              <Button size="icon" variant="secondary" disabled={editor.canvas.timeline.playing}>
                <TimerIcon size={15} />
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-2 pb-3 px-3" align="start" side="top">
            <Label className="text-xs font-medium">Duration (s)</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider disabled={editor.canvas.timeline.playing} min={5} max={60} value={[editor.canvas.timeline.duration / 1000]} onValueChange={([duration]) => editor.canvas.timeline.set("duration", duration)} />
              <Input
                type="number"
                className="h-8 w-16 text-xs"
                disabled={editor.canvas.timeline.playing}
                value={editor.canvas.timeline.duration / 1000}
                onChange={(event) => (+event.target.value < 5 || +event.target.value > 60 ? null : editor.canvas.timeline.set("duration", +event.target.value))}
              />
            </div>
          </PopoverContent>
        </Popover>
        {isTablet ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-l-none" disabled={editor.canvas.timeline.playing}>
                <ChevronUpIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-20" align="end" side="top">
              {presetDurations.map((duration) => (
                <DropdownMenuItem disabled={editor.canvas.timeline.playing} key={duration} className="text-xs pl-2.5" onClick={() => editor.canvas.timeline.set("duration", duration)}>
                  {duration}s
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <div className="flex items-center gap-3.5">
        <div className="text-xs tabular-nums">
          <span>{formatMediaDuration(editor.canvas.timeline.seek, isTablet)}</span>
          <span className="mx-1">/</span>
          <span>{formatMediaDuration(editor.canvas.timeline.duration, isTablet)}</span>
        </div>
        <Button
          size="icon"
          className="rounded-full bg-card dark:bg-secondary shadow-sm border h-10 w-10 sm:h-11 sm:w-11"
          variant="outline"
          onClick={() => (editor.canvas.timeline.playing ? editor.canvas.timeline.pause() : editor.canvas.timeline.play())}
        >
          {editor.canvas.timeline.playing ? <PauseIcon size={20} className="fill-foreground text-foreground" /> : <PlayIcon size={20} className="fill-foreground text-foreground" />}
        </Button>
      </div>
      <div>
        {isTablet ? (
          <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => editor.onToggleTimeline()}>
            <GanttChartIcon size={15} />
            <span>Timeline</span>
            <span className={cn(editor.timelineOpen ? "rotate-180" : "rotate-0")}>
              <ChevronUpIcon size={15} />
            </span>
          </Button>
        ) : (
          <Button size="icon" variant="secondary" onClick={() => editor.onToggleTimeline()}>
            <span className={cn(editor.timelineOpen ? "rotate-180" : "rotate-0")}>
              <ChevronUpIcon size={15} />
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

export const EditorPlayback = observer(_EditorPlayback);
