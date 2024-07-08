import useMeasure from "react-use-measure";
import Draggable from "react-draggable";

import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { BoxIcon, ChevronLeftIcon, ChevronRightIcon, CircleIcon, ImageIcon, MinusIcon, RectangleHorizontalIcon, TriangleIcon, TypeIcon, VideoIcon } from "lucide-react";

import { useEditorContext } from "@/context/editor";
import { FabricUtils } from "@/fabric/utils";
import { cn, createInstance } from "@/lib/utils";
import { propertiesToInclude } from "@/fabric/constants";
import { formatMediaDuration } from "@/lib/time";

const SEEK_TIME_WIDTH = 42;
const HANDLE_WIDTH = 16;

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

  useEffect(() => {
    const object = editor.canvas.instance!.getItemByName(element.name);
    if (!object) return;
    object.clone((clone: fabric.Object) => {
      clone.set({ opacity: 1, visible: true, clipPath: undefined });
      if (FabricUtils.isVideoElement(clone) && !clone.meta!.placeholder) {
        clone.seek(1);
        setTimeout(() => {
          clone.set({ filters: [] });
          clone.applyFilters();
          setBackgroundURL(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
        }, 1000);
      } else {
        setBackgroundURL(clone.toDataURL({ format: "jpeg", quality: 0.1, withoutShadow: true, withoutTransform: true }));
      }
    }, propertiesToInclude);
  }, [element]);

  const isSelected = useMemo(() => {
    if (!editor.canvas.selected) return false;
    if (FabricUtils.isActiveSelection(editor.canvas.selected)) return editor.canvas.selected.objects.some((object) => object.name === element.name);
    return editor.canvas.selected.name === element.name;
  }, [editor.canvas.selected, element]);

  const handleDragTrack = (value: number) => {
    if (editor.canvas.playing) return;
    const offset = Math.floor((value / SEEK_TIME_WIDTH) * 1000);
    const object = editor.canvas.instance!.getItemByName(element.name);
    editor.canvas.onChangeObjectTimelineProperty(object!, "offset", offset);
  };

  const handleDragLeftBar = (value: number) => {
    if (editor.canvas.playing) return;
    const offset = Math.floor((value / SEEK_TIME_WIDTH) * 1000);
    const duration = element.meta!.duration + element.meta!.offset - offset;
    const object = editor.canvas.instance!.getItemByName(element.name);
    editor.canvas.onChangeObjectTimelineProperty(object!, "offset", offset);
    editor.canvas.onChangeObjectTimelineProperty(object!, "duration", duration);
  };

  const handleDragRightBar = (value: number) => {
    if (editor.canvas.playing) return;
    const duration = Math.floor((value / SEEK_TIME_WIDTH) * 1000);
    const object = editor.canvas.instance!.getItemByName(element.name);
    editor.canvas.onChangeObjectTimelineProperty(object!, "duration", duration - element.meta!.offset);
  };

  const offset = (element.meta!.offset / 1000) * SEEK_TIME_WIDTH;
  const width = (element.meta!.duration / 1000) * SEEK_TIME_WIDTH;

  const backgroundWidth = 40 * (element.width! / element.height!) + 10;

  return (
    <div className="h-10 overflow-visible shrink-0 relative">
      {isSelected ? (
        <Draggable axis={editor.canvas.playing ? "none" : "x"} bounds={{ left: 0, right: offset + width - HANDLE_WIDTH * 2 }} position={{ y: 0, x: offset }} onDrag={(_, data) => handleDragLeftBar(data.x)}>
          <button className="flex items-center justify-center bg-blue-600 absolute top-0 h-full z-10 rounded-l-lg cursor-ew-resize" style={{ width: HANDLE_WIDTH }}>
            {!Math.round(element.meta!.offset) ? <MinusIcon size={15} className="text-white rotate-90" strokeWidth={2.5} /> : <ChevronLeftIcon size={15} className="text-white" strokeWidth={2.5} />}
          </button>
        </Draggable>
      ) : null}

      <Draggable axis={editor.canvas.playing ? "none" : "x"} bounds={{ left: 0, right: trackWidth - width }} position={{ y: 0, x: offset }} onDrag={(_, data) => handleDragTrack(data.x)}>
        <button
          onClick={(event) => (editor.canvas.playing ? null : editor.canvas.onCreateSelection(element.name, event.shiftKey))}
          className={cn("absolute top-0 h-full z-0 border-3 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing", isSelected ? "border-blue-600" : "border-gray-400")}
          style={{ width, backgroundImage: `url(${backgroundURL})`, backgroundSize: `${backgroundWidth}px 40px` }}
        >
          <span className={cn("absolute top-1 bg-foreground/50 text-card rounded-sm backdrop-blur-sm px-2 py-1 flex items-center gap-2.5 capitalize", isSelected ? "left-5" : "left-1")}>
            <span className="text-xxs">{formatMediaDuration(element.meta!.duration)}</span>
            <ElementDescription name={element.name} type={element.type} />
          </span>
        </button>
      </Draggable>

      {isSelected ? (
        <Draggable axis={editor.canvas.playing ? "none" : "x"} bounds={{ left: offset + HANDLE_WIDTH, right: trackWidth }} position={{ y: 0, x: offset + width }} onDrag={(_, data) => handleDragRightBar(data.x)}>
          <button className="inline-flex items-center justify-center bg-blue-600 absolute top-0 h-full z-10 rounded-r-lg cursor-ew-resize" style={{ width: HANDLE_WIDTH, left: -HANDLE_WIDTH }}>
            <ChevronRightIcon size={15} className="text-white" strokeWidth={2.5} />
          </button>
        </Draggable>
      ) : null}
    </div>
  );
}

function ElementDescription({ name, type }: { type?: string; name?: string }) {
  switch (type) {
    case "text":
    case "textbox":
      return (
        <div className="inline-flex items-center gap-1.5">
          <TypeIcon size={12} />
          <span className="text-xxs">Text</span>
        </div>
      );

    case "video":
      return (
        <div className="inline-flex items-center gap-1.5">
          <VideoIcon size={12} />
          <span className="text-xxs">Video</span>
        </div>
      );

    case "image":
      return (
        <div className="inline-flex items-center gap-1.5">
          <ImageIcon size={12} />
          <span className="text-xxs">Image</span>
        </div>
      );

    case "triangle":
      return (
        <div className="inline-flex items-center gap-1.5">
          <TriangleIcon size={12} />
          <span className="text-xxs">Triangle</span>
        </div>
      );

    case "rect":
      return (
        <div className="inline-flex items-center gap-1.5">
          <RectangleHorizontalIcon size={12} />
          <span className="text-xxs">Rectangle</span>
        </div>
      );

    case "ellipse":
    case "circle":
      return (
        <div className="inline-flex items-center gap-1.5">
          <CircleIcon size={12} />
          <span className="text-xxs">Ellipse</span>
        </div>
      );

    case "path":
    case "line":
    case "polygon":
    case "polyline":
      return (
        <div className="inline-flex items-center gap-1.5">
          <BoxIcon size={12} />
          <span className="text-xxs">{name?.split("_").at(0) || "Shape"}</span>
        </div>
      );

    default:
      return null;
  }
}

const TimelineItem = observer(_TimelineItem);

export const EditorTimeline = observer(_EditorTimeline);
