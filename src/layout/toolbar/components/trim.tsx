import Draggable from "react-draggable";
import useMeasure from "react-use-measure";

import { floor } from "lodash";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";
import { EditorAudioElement } from "@/types/editor";
import { drawWaveformFromAudioBuffer } from "@/lib/media";

const handleWidth = 16;

function _TrimToolbar() {
  const editor = useEditorContext();
  const type = editor.canvas.trimmer.active!.type;

  switch (type) {
    case "video":
      return <TrimToolbarVideo />;
    case "audio":
      return <TrimToolbarAudio />;
  }
}

function _TrimToolbarVideo() {
  const editor = useEditorContext();
  const trim = editor.canvas.trimmer.active!.object as fabric.Video;

  const [ref, dimensions] = useMeasure();
  const containerWidth = dimensions.width - handleWidth;

  const [background, setBackground] = useState("");
  const [data, setData] = useState({ trimStartX: 0, trimEndX: 0, duration: 0 });

  useEffect(() => {
    if (containerWidth <= 0) return;
    const object = editor.canvas.instance!.getItemByName(trim.name) as fabric.Video;
    const trimStartX = (containerWidth / object.duration(false)) * object.trimStart!;
    const trimEndX = containerWidth - (containerWidth / object.duration(false)) * object.trimEnd!;
    setData({ trimStartX: trimStartX, trimEndX: trimEndX, duration: object.duration(false) });
  }, [containerWidth]);

  useEffect(() => {
    const video = editor.canvas.instance!.getItemByName(trim.name) as fabric.Video;
    if (background || video.meta!.placeholder) return;
    video.clone((clone: fabric.Video) => {
      clone.set({ opacity: 1, visible: true, clipPath: undefined });
      clone.seek(1);
      setTimeout(() => {
        clone.set({ filters: [] });
        clone.applyFilters();
        setBackground(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
      }, 500);
    });
  }, []);

  const backgroundWidth = 40 * (trim.width! / trim.height!) + 10;
  const trackWidth = containerWidth - data.trimStartX - (containerWidth - data.trimEndX) - handleWidth;
  const absoluteDuration = data.duration - (data.trimStartX / containerWidth) * data.duration - ((containerWidth - data.trimEndX) / containerWidth) * data.duration;

  const handleDragChange = (key: "trimStartX" | "trimEndX", value: number) => {
    setData((state) => ({ ...state, [key]: value }));
  };

  const handleChanges = () => {
    const trimStart = (data.trimStartX / containerWidth) * data.duration;
    const trimEnd = ((containerWidth - data.trimEndX) / containerWidth) * data.duration;
    editor.canvas.onChangeActiveVideoProperty("trimStart", trimStart);
    editor.canvas.onChangeActiveVideoProperty("trimEnd", trimEnd);
    editor.canvas.trimmer.exit();
  };

  const style = {
    backgroundImage: `url(${background})`,
    backgroundSize: `${backgroundWidth}px 40px`,
  };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden pr-12">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          <PlayIcon size={15} className="" fill="#000000" />
        </Button>
        <div className="relative">
          <Input className="h-8 text-xs w-24 pr-8" value={floor(absoluteDuration, 1)} readOnly />
          <span className="absolute text-gray-500 text-xs right-2.5 top-1/2 -translate-y-1/2 font-medium">s</span>
        </div>
      </div>
      <div ref={ref} className="mx-6 flex-1 h-8 overflow-hidden relative rounded-md">
        <div className={cn("bg-background items-stretch bg-repeat-x bg-center shrink-0 h-full w-full")} style={style} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute h-full top-0 flex">
          <Draggable axis="x" bounds={{ left: 0, right: data.trimEndX - handleWidth }} position={{ x: data.trimStartX, y: 0 }} onDrag={(_, data) => handleDragChange("trimStartX", data.x)}>
            <button className="absolute grid place-items-center h-full bg-primary rounded-l-md z-20" style={{ width: handleWidth }}>
              <ChevronLeftIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
          <div className="h-full absolute border-t-2 border-b-2 border-primary mix-blend-overlay bg-gray-300 z-10" style={{ left: data.trimStartX + handleWidth, width: trackWidth }}></div>
          <Draggable axis="x" bounds={{ left: data.trimStartX + handleWidth, right: containerWidth }} position={{ x: data.trimEndX, y: 0 }} onDrag={(_, data) => handleDragChange("trimEndX", data.x)}>
            <button className="absolute grid place-items-center h-full bg-primary rounded-r-md z-20" style={{ width: handleWidth }}>
              <ChevronRightIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
        </div>
      </div>
      <Button size="sm" className="gap-1.5 pl-2.5 bg-primary hover:bg-primary/90" onClick={handleChanges}>
        <CheckIcon size={15} />
        <span>Done</span>
      </Button>
    </div>
  );
}

function _TrimToolbarAudio() {
  const editor = useEditorContext();
  const audio = editor.canvas.trimmer.active!.object as EditorAudioElement;

  const [ref, dimensions] = useMeasure();
  const containerWidth = dimensions.width - handleWidth;

  const [background, setBackground] = useState("");
  const [trim, setTrim] = useState(0);
  const [timeline, setTimeline] = useState(0);

  useEffect(() => {
    if (containerWidth <= 0) return;
    const trim = (containerWidth / audio.duration) * audio.trim;
    const timeline = (containerWidth / audio.duration) * audio.timeline + trim;
    setTrim(trim);
    setTimeline(timeline);
  }, [containerWidth]);

  useEffect(() => {
    if (!dimensions.width) return;
    drawWaveformFromAudioBuffer(audio.buffer, 40, dimensions.width).then((blob) => setBackground(URL.createObjectURL(blob)));
    return () => URL.revokeObjectURL(background);
  }, [dimensions]);

  const handleChanges = () => {
    const _trim = (trim / containerWidth) * audio.duration;
    const _timeline = ((containerWidth - timeline) / containerWidth) * audio.duration;
    editor.canvas.audio.update(audio.id, { trim: _trim, timeline: audio.duration - _trim - _timeline });
    editor.canvas.trimmer.exit();
  };

  const absoluteDuration = audio.duration - (trim / containerWidth) * audio.duration - ((containerWidth - timeline) / containerWidth) * audio.duration;
  const trackWidth = containerWidth - trim - (containerWidth - timeline) - handleWidth;
  const style = { backgroundImage: `url(${background})` };

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden pr-12">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          <PlayIcon size={15} className="" fill="#000000" />
        </Button>
        <div className="relative">
          <Input className="h-8 text-xs w-24 pr-8" value={floor(absoluteDuration, 1)} readOnly />
          <span className="absolute text-gray-500 text-xs right-2.5 top-1/2 -translate-y-1/2 font-medium">s</span>
        </div>
      </div>
      <div ref={ref} className="mx-6 flex-1 h-8 overflow-hidden relative rounded-md">
        <div className={cn("bg-background items-stretch bg-repeat-x bg-center shrink-0 h-full w-full")} style={style} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute h-full top-0 flex">
          <Draggable axis="x" bounds={{ left: 0, right: timeline - handleWidth }} position={{ x: trim, y: 0 }} onDrag={(_, data) => setTrim(data.x)}>
            <button className="absolute grid place-items-center h-full bg-primary rounded-l-md z-20" style={{ width: handleWidth }}>
              <ChevronLeftIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
          <div className="h-full absolute border-t-2 border-b-2 border-primary mix-blend-overlay bg-gray-300 z-10" style={{ left: trim + handleWidth, width: trackWidth }} />
          <Draggable axis="x" bounds={{ left: trim + handleWidth, right: containerWidth }} position={{ x: timeline, y: 0 }} onDrag={(_, data) => setTimeline(data.x)}>
            <button className="absolute grid place-items-center h-full bg-primary rounded-r-md z-20" style={{ width: handleWidth }}>
              <ChevronRightIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
        </div>
      </div>
      <Button size="sm" className="gap-1.5 pl-2.5 bg-primary hover:bg-primary/90" onClick={handleChanges}>
        <CheckIcon size={15} />
        <span>Done</span>
      </Button>
    </div>
  );
}

export const TrimToolbar = observer(_TrimToolbar);
const TrimToolbarVideo = observer(_TrimToolbarVideo);
const TrimToolbarAudio = observer(_TrimToolbarAudio);
