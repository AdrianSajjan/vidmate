import useMeasure from "react-use-measure";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react";
import { floor } from "lodash";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { useEditorContext } from "@/context/editor";
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const handleWidth = 16;

function _TrimToolbar() {
  const editor = useEditorContext();
  const [ref, container] = useMeasure();

  const [background, setBackground] = useState("");

  const video = useMemo(() => {
    const video = editor.canvas.instance!.getItemByName(editor.canvas.trim!.name);
    return video as fabric.Video;
  }, [editor.canvas.trim]);

  useEffect(() => {
    if (background || video.meta?.placeholder) return;
    video.clone((clone: fabric.Video) => {
      clone.set({ opacity: 1, visible: true, clipPath: undefined });
      clone.seek(1);
      setTimeout(() => {
        clone.set({ filters: [] });
        clone.applyFilters();
        setBackground(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
      }, 1000);
    });
  }, [video]);

  const backgroundWidth = 40 * (video.width! / video.height!) + 10;
  const trackWidth = (container.width / video.duration(false)) * video.duration(true);

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden pr-12">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          <PlayIcon size={15} className="" fill="#000000" />
        </Button>
        <div className="relative">
          <Input className="h-8 text-xs w-24 pr-8" value={floor(video.duration(true), 1)} readOnly />
          <span className="absolute text-gray-500 text-xs right-2.5 top-1/2 -translate-y-1/2 font-medium">s</span>
        </div>
      </div>
      <div ref={ref} className="mx-6 flex-1 h-8 overflow-hidden relative rounded-md">
        <div className={cn("bg-background items-stretch bg-repeat-x bg-center shrink-0 h-full w-full")} style={{ backgroundImage: `url(${background})`, backgroundSize: `${backgroundWidth}px 40px` }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute h-full top-0 flex">
          <Tooltip open>
            <TooltipTrigger asChild>
              <button className="grid place-items-center h-full bg-blue-600 rounded-l-md" style={{ width: handleWidth }}>
                <ChevronLeftIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="px-2 py-1">
              <TooltipArrow />
              <span className="text-xxs font-medium">{floor(video.trimLeft, 1)}s</span>
            </TooltipContent>
          </Tooltip>
          <div className="h-full border-2 border-blue-600 mix-blend-overlay bg-white" style={{ width: trackWidth - handleWidth * 2 }}></div>
          <Tooltip open>
            <TooltipTrigger asChild>
              <button className="grid place-items-center h-full bg-blue-600 rounded-r-md" style={{ width: handleWidth }}>
                <ChevronRightIcon size={14} strokeWidth={2.5} stroke="#ffffff" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="px-2 py-1">
              <TooltipArrow />
              <span className="text-xxs font-medium">{floor(video.duration(false) - video.trimRight!, 1)}s</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Button size="sm" className="gap-1.5 pl-2.5 bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90" onClick={() => editor.canvas.onTrimVideoEnd()}>
        <CheckIcon size={15} />
        <span>Done</span>
      </Button>
    </div>
  );
}

export const TrimToolbar = observer(_TrimToolbar);
