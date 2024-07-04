import useMeasure from "react-use-measure";

import { motion, useAnimationControls } from "framer-motion";
import { BoxIcon, ChevronLeftIcon, ChevronRightIcon, CircleIcon, ImageIcon, RectangleHorizontalIcon, TriangleIcon, TypeIcon, VideoIcon } from "lucide-react";
import { observer } from "mobx-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useEditorContext } from "@/context/editor";
import { FabricUtils } from "@/fabric/utils";
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
    if (!editor.canvas.playing) return;
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
      clone.set({ opacity: 1, visible: true, clipPath: undefined });
      if (FabricUtils.isVideoElement(clone) && !!backgroundURL) return;
      setBackgroundURL(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
    });
  }, [element, editor.canvas.instance]);

  useEffect(() => {
    const offset = (element.meta!.offset / 1000) * SEEK_TIME_WIDTH;
    controls.set({ x: offset });
  }, [element.meta!.offset]);

  const isSelected = useMemo(() => {
    if (!editor.canvas.selected) return false;
    if (FabricUtils.isActiveSelection(editor.canvas.selected)) return editor.canvas.selected.objects.some((object) => object.name === element.name);
    return editor.canvas.selected.name === element.name;
  }, [editor.canvas.selected, element]);

  function onDragEnd() {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    const matrix = createInstance(DOMMatrixReadOnly, style.transform);
    const offset = Math.floor((matrix.m41 / SEEK_TIME_WIDTH) * 1000);
    const object = editor.canvas.instance!.getItemByName(element.name);
    editor.canvas.onChangeObjectTimelineProperty(object!, "offset", offset);
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
      onClick={(event) => (editor.canvas.playing ? null : editor.canvas.onCreateSelection(element.name, event.shiftKey))}
      className={cn("h-10 rounded-lg bg-card border-[3px] overflow-visible flex items-stretch relative bg-repeat-x bg-center", isSelected ? "border-blue-600" : "border-foreground/20")}
      style={{
        width,
        backgroundImage: `url(${backgroundURL})`,
        backgroundSize: `${backgroundWidth}px 40px`,
      }}
    >
      {isSelected ? (
        <motion.div className="pr-0.5 flex items-center justify-center bg-blue-600">
          <ChevronLeftIcon size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
      ) : null}
      <div className="flex-1 relative">
        <span className="absolute top-1 left-1 bg-foreground/50 text-card rounded-sm backdrop-blur-sm px-2 py-1 flex items-center gap-1.5 capitalize">
          <ElementDescription name={element.name} type={element.type} />
        </span>
      </div>
      {isSelected ? (
        <motion.div className="pl-0.5 flex items-center justify-center bg-blue-600">
          <ChevronRightIcon size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

function ElementDescription({ name, type }: { type?: string; name?: string }) {
  switch (type) {
    case "text":
    case "textbox":
      return (
        <Fragment>
          <TypeIcon size={12} />
          <span className="text-xxs">Text</span>
        </Fragment>
      );

    case "video":
      return (
        <Fragment>
          <VideoIcon size={12} />
          <span className="text-xxs">Video</span>
        </Fragment>
      );

    case "image":
      return (
        <Fragment>
          <ImageIcon size={12} />
          <span className="text-xxs">Image</span>
        </Fragment>
      );

    case "triangle":
      return (
        <Fragment>
          <TriangleIcon size={12} />
          <span className="text-xxs">Triangle</span>
        </Fragment>
      );

    case "rect":
      return (
        <Fragment>
          <RectangleHorizontalIcon size={12} />
          <span className="text-xxs">Rectangle</span>
        </Fragment>
      );

    case "ellipse":
    case "circle":
      return (
        <Fragment>
          <CircleIcon size={12} />
          <span className="text-xxs">Ellipse</span>
        </Fragment>
      );

    case "path":
    case "line":
    case "polygon":
    case "polyline":
      return (
        <Fragment>
          <BoxIcon size={12} />
          <span className="text-xxs">{name?.split("_").at(0) || "Shape"}</span>
        </Fragment>
      );

    default:
      return null;
  }
}

const TimelineItem = observer(_TimelineItem);

export const EditorTimeline = observer(_EditorTimeline);
