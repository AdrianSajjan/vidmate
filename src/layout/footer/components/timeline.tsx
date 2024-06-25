import useMeasure from "react-use-measure";

import { motion, useAnimationControls } from "framer-motion";
import { TypeIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useCallback } from "react";

import { useEditorContext } from "@/context/editor";
import { isActiveSelection } from "@/fabric/utils";
import { cn, createInstance } from "@/lib/utils";

const SEEK_TIME_WIDTH = 42;

function _EditorTimeline() {
  const [containerRef, { width }] = useMeasure();

  const editor = useEditorContext();
  const controls = useAnimationControls();

  const seekTimeInSeconds = editor.canvas.seek / 1000;
  const durationInSeconds = editor.canvas.duration / 1000;

  const trackWidth = durationInSeconds * SEEK_TIME_WIDTH;
  const trackBackgroundWidth = width > (durationInSeconds + 6) * SEEK_TIME_WIDTH ? width : (durationInSeconds + 6) * SEEK_TIME_WIDTH;
  const timelineAmount = Math.floor(trackBackgroundWidth / SEEK_TIME_WIDTH);

  const renderTimelineTime = useCallback((_: number, index: number) => {
    if (index === 0 || index % 5 === 0)
      return (
        <span key={index} className="text-xxs shrink-0 cursor-pointer" style={{ width: SEEK_TIME_WIDTH }}>
          {index}s
        </span>
      );
    return (
      <span key={index} className="text-xxs shrink-0 cursor-pointer text-gray-400" style={{ width: SEEK_TIME_WIDTH }}>
        •
      </span>
    );
  }, []);

  const onClickSeekTime = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const seek = x / SEEK_TIME_WIDTH;
    editor.canvas.onChangeSeekTime(seek);
    controls.set({ x });
  };

  const onSeekHandleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent) => {
    const element = event.target;
    if (element instanceof Element) {
      const style = getComputedStyle(element);
      const matrix = createInstance(DOMMatrixReadOnly, style.transform);
      const x = matrix.m41;
      const seek = x / SEEK_TIME_WIDTH;
      editor.canvas.onChangeSeekTime(seek);
    }
  };

  return (
    <div className="flex flex-1 shrink">
      <div className="bg-background shrink-0 w-2">
        <div className="h-8 w-full bg-card/40 dark:bg-gray-900/40 flex justify-center items-center"></div>
      </div>
      <div className="flex-1 flex flex-col bg-background shrink-0 overflow-x-scroll relative" ref={containerRef}>
        <div className="h-8 absolute bg-card/40 dark:bg-gray-900/40" style={{ width: trackBackgroundWidth }} />
        <div className="h-8 absolute bg-card dark:bg-gray-900 cursor-pointer" style={{ width: trackWidth }} onClick={onClickSeekTime} />
        <div className="h-8 absolute inset-0 flex items-center z-20 pointer-events-none">{Array.from({ length: timelineAmount }, renderTimelineTime)}</div>
        <motion.div
          drag="x"
          animate={controls}
          dragElastic={false}
          dragMomentum={false}
          onDragEnd={onSeekHandleDragEnd}
          dragConstraints={{ left: 0, right: trackWidth }}
          initial={{ x: seekTimeInSeconds * SEEK_TIME_WIDTH }}
          className="absolute h-full w-1 bg-blue-400 dark:bg-blue-600 cursor-ew-resize z-10"
        />
        <div className="absolute top-8 pt-2 bottom-0 overflow-y-scroll flex flex-col gap-1" style={{ width: trackBackgroundWidth }}>
          {editor.canvas.elements.map((element) => (
            <TimelineItem key={element.name} element={element} />
          ))}
        </div>
      </div>
    </div>
  );
}

function _TimelineItem({ element }: { element: fabric.Object }) {
  const editor = useEditorContext();

  const width = 356;
  const isSelected = editor.canvas.selected ? (isActiveSelection(editor.canvas.selected) ? editor.canvas.selected === element.group : editor.canvas.selected.name === element.name) : false;

  const backgroundWidth = 32 * (element.width! / element.height!) + 10;
  const backgroundURL = element.toDataURL({ withoutShadow: true, format: "jpeg", quality: 0.1 });

  switch (element.type) {
    case "textbox": {
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={(event) => editor.canvas.onCreateSelection(element, event.shiftKey)}
          className={cn("h-10 rounded-md bg-card border-2 overflow-hidden flex items-center justify-center relative bg-repeat-x bg-center", isSelected ? "border-blue-500" : "border-foreground/20")}
          style={{
            width,
            backgroundImage: `url(${backgroundURL})`,
            backgroundSize: `${backgroundWidth}px 32px`,
          }}
        >
          <span className="absolute top-1 left-1 bg-foreground/50 text-card rounded-sm backdrop-blur-sm px-2 py-1">
            <TypeIcon size={12} />
          </span>
        </div>
      );
    }
    default:
      return null;
  }
}

const TimelineItem = observer(_TimelineItem);

export const EditorTimeline = observer(_EditorTimeline);
