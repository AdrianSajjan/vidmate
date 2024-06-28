import useMeasure from "react-use-measure";

import { motion, useAnimationControls } from "framer-motion";
import { BoxIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, TypeIcon } from "lucide-react";
import { observer } from "mobx-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  useEffect(() => {
    controls.set({ x: seekTimeInSeconds * SEEK_TIME_WIDTH });
  }, [seekTimeInSeconds, controls]);

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
  };

  const onSeekHandleDrag = (event: MouseEvent | TouchEvent | PointerEvent) => {
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
    <div className={cn("flex flex-1 shrink select-none", editor.isTimelineOpen ? "h-auto" : "h-0 overflow-hidden appearance-none")}>
      <div className="bg-background shrink-0 w-2">
        <div className="h-8 w-full bg-card/40 dark:bg-gray-900/40 flex justify-center items-center"></div>
      </div>
      <div className="flex-1 flex flex-col bg-background shrink-0 overflow-x-scroll relative" ref={containerRef}>
        <div className="h-8 absolute bg-card/40 dark:bg-gray-900/40" style={{ width: trackBackgroundWidth }} />
        <div className="h-8 absolute bg-card dark:bg-gray-900 cursor-pointer" style={{ width: trackWidth }} onClick={onClickSeekTime} />
        <div className="h-8 absolute inset-0 flex items-center z-20 pointer-events-none">{Array.from({ length: timelineAmount }, renderTimelineTime)}</div>
        <motion.div
          animate={controls}
          dragElastic={false}
          dragMomentum={false}
          onDragEnd={onSeekHandleDrag}
          drag={editor.canvas.playing ? false : "x"}
          dragConstraints={{ left: 0, right: trackWidth }}
          className={cn("absolute h-full w-1 bg-blue-400 dark:bg-blue-600 z-10", editor.canvas.playing ? "cursor-not-allowed" : "cursor-ew-resize")}
        />
        <div className="absolute top-8 pt-2 bottom-0 overflow-y-scroll flex flex-col gap-1" style={{ width: trackBackgroundWidth }}>
          {editor.canvas.elements.map((element) => (
            <TimelineItem key={element.name} element={element} trackWidth={trackWidth} />
          ))}
        </div>
      </div>
    </div>
  );
}

function _TimelineItem({ element, trackWidth }: { element: fabric.Object; trackWidth: number }) {
  const editor = useEditorContext();
  const [backgroundURL, setBackgroundURL] = useState("");

  const controls = useAnimationControls();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const object = editor.canvas.instance?.getItemByName(element.name);
    object?.clone((clone: fabric.Object) => {
      clone.opacity = 1;
      clone.visible = true;
      clone.clipPath = undefined;
      setBackgroundURL(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
    });
  }, [element, editor.canvas.instance]);

  useEffect(() => {
    const offset = (element.meta!.offset / 1000) * SEEK_TIME_WIDTH;
    controls.set({ x: offset });
  }, [element.meta!.offset]);

  const isSelected = useMemo(() => {
    if (!editor.canvas.selected) return false;
    if (isActiveSelection(editor.canvas.selected)) return editor.canvas.selected.objects.some((object) => object.name === element.name);
    return editor.canvas.selected.name === element.name;
  }, [editor.canvas.selected, element]);

  function onDragEnd() {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    const matrix = createInstance(DOMMatrixReadOnly, style.transform);
    const offset = Math.floor((matrix.m41 / SEEK_TIME_WIDTH) * 1000);
    editor.canvas.onChangeObjectTimelineOffset(element.name!, offset);
  }

  const width = (element.meta!.duration / 1000) * SEEK_TIME_WIDTH;
  const backgroundWidth = 40 * (element.width! / element.height!) + 10;

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      animate={controls}
      dragElastic={false}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      drag={editor.canvas.playing ? false : "x"}
      dragConstraints={{ left: 0, right: trackWidth - width }}
      onClick={(event) => editor.canvas.onCreateSelection(element.name, event.shiftKey)}
      className={cn("h-10 rounded-lg bg-card border-[3px] overflow-visible flex items-stretch relative bg-repeat-x bg-center", isSelected ? "border-blue-500" : "border-foreground/20")}
      style={{
        width,
        backgroundImage: `url(${backgroundURL})`,
        backgroundSize: `${backgroundWidth}px 40px`,
      }}
    >
      {isSelected ? (
        <motion.div className="px-px flex items-center justify-center">
          <ChevronLeftIcon className="text-blue-600" strokeWidth={2.5} />
        </motion.div>
      ) : null}
      <div className="flex-1 relative">
        <span className="absolute top-1 left-1 bg-foreground/50 text-card rounded-sm backdrop-blur-sm px-2 py-1 flex items-center gap-1.5 capitalize">
          {(() => {
            switch (element.type) {
              case "textbox":
                return <TypeIcon size={12} />;
              case "image":
                return <ImageIcon size={12} />;
              case "path":
              case "rect":
              case "line":
              case "circle":
              case "polygon":
              case "triangle":
                return (
                  <Fragment>
                    <BoxIcon size={12} />
                    <span className="text-xxs">{element.name?.split("_").at(0) || "shape"}</span>
                  </Fragment>
                );
              default:
                return null;
            }
          })()}
        </span>
      </div>
      {isSelected ? (
        <motion.div className="px-px flex items-center justify-center">
          <ChevronRightIcon className="text-blue-600" strokeWidth={2.5} />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

const TimelineItem = observer(_TimelineItem);

export const EditorTimeline = observer(_EditorTimeline);
