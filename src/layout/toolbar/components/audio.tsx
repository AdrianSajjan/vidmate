import { AudioWaveformIcon, GanttChartIcon, Trash2Icon, Volume2Icon } from "lucide-react";
import { observer } from "mobx-react";
import { floor } from "lodash";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

import { useEditorContext } from "@/context/editor";
import { EditorAudioElement } from "@/types/editor";

function _AudioToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as unknown as EditorAudioElement;

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-2.5">
        <Button onClick={() => editor.canvas.onTrimAudioStart(selected)} variant="outline" size="sm" className="gap-1.5">
          <AudioWaveformIcon size={15} />
          <span className="text-xs font-normal">Trim</span>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 data-[state=open]:bg-card">
              <Volume2Icon size={15} />
              <span className="text-xs font-normal">Volume</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="pt-3 pb-3 px-3" align="start">
            <Label className="text-xs font-medium">Volume (%)</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={0} max={100} value={[selected.volume * 100]} onValueChange={([volume]) => editor.canvas.onChangeAudioProperties(selected.id, { volume: volume / 100 })} />
              <Input
                min={1}
                autoFocus
                max={100}
                value={selected.volume * 100}
                type="number"
                className="h-8 w-20 text-xs"
                onChange={(event) => (+event.target.value < 0 || +event.target.value > 100 ? null : editor.canvas.onChangeAudioProperties(selected.id, { volume: +event.target.value / 100 }))}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <div className="flex items-center gap-2.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 data-[state=open]:bg-card">
              <GanttChartIcon size={15} />
              <span>Timeline</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="pt-3 pb-3 px-3" align="start">
            <Label className="text-xs font-medium">Duration (s)</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={1} max={selected.duration} value={[selected.timeline]} onValueChange={([timeline]) => editor.canvas.onChangeAudioProperties(selected.id, { timeline })} />
              <Input
                min={1}
                autoFocus
                step={0.5}
                max={selected.duration}
                type="number"
                className="h-8 w-20 text-xs"
                value={floor(selected.timeline, 2)}
                onChange={(event) => (+event.target.value > 0 ? editor.canvas.onChangeAudioProperties(selected.id, { timeline: +event.target.value }) : null)}
              />
            </div>
            <Label className="text-xs font-medium">Offset (s)</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={0} max={editor.canvas.duration / 1000 - selected.timeline} value={[selected.offset]} onValueChange={([offset]) => editor.canvas.onChangeAudioProperties(selected.id, { offset })} />
              <Input
                min={0}
                step={0.5}
                autoFocus
                max={editor.canvas.duration / 1000 - selected.timeline}
                type="number"
                className="h-8 w-20 text-xs"
                value={floor(selected.offset, 2)}
                onChange={(event) => (+event.target.value > 0 ? editor.canvas.onChangeAudioProperties(selected.id, { offset: +event.target.value }) : null)}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => editor.canvas.onDeleteAudio(selected.id)}>
          <Trash2Icon size={15} />
          <span className="text-xs font-normal">Delete</span>
        </Button>
      </div>
    </div>
  );
}

export const AudioToolbar = observer(_AudioToolbar);
