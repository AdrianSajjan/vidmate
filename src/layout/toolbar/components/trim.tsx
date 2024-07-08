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

const handleWidth = 16;

function _TrimToolbar() {
  const editor = useEditorContext();
  const video = editor.canvas.trim!;

  const [ref, dimensions] = useMeasure();
  const containerWidth = dimensions.width - handleWidth;

  const [background, setBackground] = useState("");
  const [data, setData] = useState({ trimLeftX: 0, trimRightX: 0, duration: 0 });

  useEffect(() => {
    const object = editor.canvas.instance!.getItemByName(video.name) as fabric.Video;
    const trimLeftX = (containerWidth / object.duration(false)) * object.trimLeft!;
    const trimRightX = containerWidth - (containerWidth / object.duration(false)) * object.trimRight!;
    setData({ trimLeftX: trimLeftX, trimRightX: trimRightX, duration: object.duration(false) });
  }, [dimensions]);

  useEffect(() => {
    const video = editor.canvas.instance!.getItemByName(editor.canvas.trim!.name) as fabric.Video;
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

  const backgroundWidth = 40 * (video.width! / video.height!) + 10;
  const trackWidth = containerWidth - data.trimLeftX - (containerWidth - data.trimRightX) - handleWidth;
  const absoluteDuration = data.duration - (data.trimLeftX / containerWidth) * data.duration - ((containerWidth - data.trimRightX) / containerWidth) * data.duration;

  const handleDragChange = (key: "trimLeftX" | "trimRightX", value: number) => {
    setData((state) => ({ ...state, [key]: value }));
  };

  const handleChanges = () => {
    const trimLeft = (data.trimLeftX / containerWidth) * data.duration;
    const trimRight = ((containerWidth - data.trimRightX) / containerWidth) * data.duration;
    editor.canvas.onChangeActiveVideoProperty("trimLeft", trimLeft);
    editor.canvas.onChangeActiveVideoProperty("trimRight", trimRight);
    editor.canvas.onTrimVideoEnd();
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
        <div className={cn("bg-background items-stretch bg-repeat-x bg-center shrink-0 h-full w-full")} style={{ backgroundImage: `url(${background})`, backgroundSize: `${backgroundWidth}px 40px` }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute h-full top-0 flex">
          <Draggable axis="x" bounds={{ left: 0, right: data.trimRightX - handleWidth }} position={{ x: data.trimLeftX, y: 0 }} onDrag={(_, data) => handleDragChange("trimLeftX", data.x)}>
            <button className="absolute grid place-items-center h-full bg-blue-600 rounded-l-md z-20" style={{ width: handleWidth }}>
              <ChevronLeftIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
          <div className="h-full absolute border-t-2 border-b-2 border-blue-600 mix-blend-overlay bg-gray-300 z-10" style={{ left: data.trimLeftX + handleWidth, width: trackWidth }}></div>
          <Draggable axis="x" bounds={{ left: data.trimLeftX + handleWidth, right: containerWidth }} position={{ x: data.trimRightX, y: 0 }} onDrag={(_, data) => handleDragChange("trimRightX", data.x)}>
            <button className="absolute grid place-items-center h-full bg-blue-600 rounded-r-md z-20" style={{ width: handleWidth }}>
              <ChevronRightIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
            </button>
          </Draggable>
        </div>
      </div>
      <Button size="sm" className="gap-1.5 pl-2.5 bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90" onClick={handleChanges}>
        <CheckIcon size={15} />
        <span>Done</span>
      </Button>
    </div>
  );
}

export const TrimToolbar = observer(_TrimToolbar);
