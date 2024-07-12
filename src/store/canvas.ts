import anime from "animejs";

import { fabric } from "fabric";
import { floor, throttle } from "lodash";
import { EntryAnimation, ExitAnimation } from "canvas";
import { makeAutoObservable } from "mobx";

import { activityIndicator, elementsToExclude, propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise, isVideoElement } from "@/lib/utils";
import { EditorAudioElement, EditorTrim } from "@/types/editor";

export const minLayerStack = 3;
export const timelineDuration = 5000;
export const artboardHeight = 1080;
export const artboardWidth = 1080;
export const canvasYPadding = 100;
export const artboardFill = "#FFFFFF";

export class Canvas {
  artboard?: fabric.Rect;
  instance?: fabric.Canvas;
  recorder?: fabric.StaticCanvas;

  audioContext: AudioContext;
  audios: EditorAudioElement[];

  elements: fabric.Object[];
  selected?: fabric.Object | null;

  crop?: fabric.Image | null;
  trim?: EditorTrim | null;

  seek: number;
  duration: number;
  loop: boolean;
  playing: boolean;
  timeline?: anime.AnimeTimelineInstance | null;

  zoom: number;
  fill: string;
  width: number;
  height: number;

  hasControls: boolean;
  viewportTransform: number[];

  constructor() {
    this.zoom = 0.5;
    this.elements = [];

    this.audios = [];
    this.audioContext = createInstance(AudioContext);

    this.seek = 0;
    this.loop = false;
    this.playing = false;
    this.duration = timelineDuration;

    this.hasControls = true;
    this.viewportTransform = [];

    this.fill = artboardFill;
    this.width = artboardWidth;
    this.height = artboardHeight;

    makeAutoObservable(this);
  }

  private isElementExcluded(object: fabric.Object) {
    return elementsToExclude.includes(object.name!) || object.name!.startsWith("crop") || object.name!.startsWith("clone") || object.name!.startsWith("clip") || object.name!.startsWith("overlay");
  }

  private onRefreshElements() {
    if (!this.instance) return;
    this.elements = this.instance._objects.filter((object) => !this.isElementExcluded(object)).map((object) => object.toObject(propertiesToInclude));
  }

  private onAddElement(object?: fabric.Object) {
    if (!object || this.isElementExcluded(object)) return;
    this.elements.push(object.toObject(propertiesToInclude));
  }

  private onUpdateElement(object?: fabric.Object) {
    const index = this.elements.findIndex((element) => element.name === object?.name);
    if (index === -1 || !object) return;
    const element = object.toObject(propertiesToInclude);
    if (object.name === this.selected?.name) this.selected = element;
    if (object.name === this.trim?.selected.name) this.trim!.selected = element;
    if (object.name === this.crop?.name) this.crop = element;
    this.elements[index] = element;
  }

  private onUpdateCrop(image?: fabric.Image | null) {
    this.crop = image ? image.toObject(propertiesToInclude) : null;
  }

  private onUpdateZoom(zoom: number) {
    this.zoom = zoom;
  }

  private onUpdateTimelineStatus(playing: boolean) {
    this.playing = playing;
  }

  private onToggleControls(object: fabric.Object, enabled: boolean) {
    object.hasControls = enabled;
    this.hasControls = enabled;
  }

  private onInitializeGuidelines() {
    if (!this.instance || !this.artboard) return;

    const hCenter = this.artboard.left! + this.artboard.width! / 2;
    const vCenter = this.artboard.top! + this.artboard.height! / 2;

    this.instance.add(
      createInstance(fabric.Line, [hCenter, 0, hCenter, this.instance.height!], {
        opacity: 0,
        selectable: false,
        evented: false,
        name: "center_h",
      }),
    );
    this.instance.add(
      createInstance(fabric.Line, [0, vCenter, this.instance.width!, vCenter], {
        opacity: 0,
        selectable: false,
        evented: false,
        name: "center_v",
      }),
    );
    this.instance.add(
      createInstance(fabric.Line, [hCenter, this.artboard.top!, hCenter, this.artboard.height! + this.artboard.top!], {
        stroke: "red",
        opacity: 0,
        selectable: false,
        evented: false,
        name: "line_h",
      }),
    );
    this.instance.add(
      createInstance(fabric.Line, [this.artboard.left!, vCenter, this.artboard.width! + this.artboard.left!, vCenter], {
        stroke: "red",
        opacity: 0,
        selectable: false,
        evented: false,
        name: "line_v",
      }),
    );

    this.instance.requestRenderAll();
  }

  private onSnapToGuidelines(event: fabric.IEvent<MouseEvent>) {
    const lineH = this.instance?.getItemByName("line_h") as fabric.Line | null;
    const lineV = this.instance?.getItemByName("line_v") as fabric.Line | null;

    if (!this.instance || !this.artboard || !lineH || !lineV) return;

    lineH.opacity = 0;
    lineV.opacity = 0;
    this.instance.requestRenderAll();

    const snapZone = 5;
    const targetLeft = event.target!.left!;
    const targetTop = event.target!.top!;
    const targetWidth = event.target!.width! * event.target!.scaleX!;
    const targetHeight = event.target!.height! * event.target!.scaleY!;

    this.instance.forEachObject((obj) => {
      if (obj != event.target && obj != lineH && obj != lineV && obj.evented) {
        if (obj.get("name") == "center_h" || obj.get("name") == "center_v") {
          const check1 = [[targetLeft, obj.left!, 1]];
          const check2 = [[targetTop, obj.top!, 1]];

          for (let i = 0; i < check1.length; i++) {
            FabricUtils.checkHorizontalSnap(this.instance!, this.artboard!, lineH!, check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            FabricUtils.checkVerticalSnap(this.instance!, this.artboard!, lineV!, check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
          }
        } else {
          const check1 = [
            [targetLeft, obj.left!, 1],
            [targetLeft, obj.left! + (obj.width! * obj.scaleX!) / 2, 1],
            [targetLeft, obj.left! - (obj.width! * obj.scaleX!) / 2, 1],
            [targetLeft + targetWidth / 2, obj.left!, 2],
            [targetLeft + targetWidth / 2, obj.left! + (obj.width! * obj.scaleX!) / 2, 2],
            [targetLeft + targetWidth / 2, obj.left! - (obj.width! * obj.scaleX!) / 2, 2],
            [targetLeft - targetWidth / 2, obj.left!, 3],
            [targetLeft - targetWidth / 2, obj.left! + (obj.width! * obj.scaleX!) / 2, 3],
            [targetLeft - targetWidth / 2, obj.left! - (obj.width! * obj.scaleX!) / 2, 3],
          ];
          const check2 = [
            [targetTop, obj.top!, 1],
            [targetTop, obj.top! + (obj.height! * obj.scaleY!) / 2, 1],
            [targetTop, obj.top! - (obj.height! * obj.scaleY!) / 2, 1],
            [targetTop + targetHeight / 2, obj.top!, 2],
            [targetTop + targetHeight / 2, obj.top! + (obj.height! * obj.scaleY!) / 2, 2],
            [targetTop + targetHeight / 2, obj.top! - (obj.height! * obj.scaleY!) / 2, 2],
            [targetTop - targetHeight / 2, obj.top!, 3],
            [targetTop - targetHeight / 2, obj.top! + (obj.height! * obj.scaleY!) / 2, 3],
            [targetTop - targetHeight / 2, obj.top! - (obj.height! * obj.scaleY!) / 2, 3],
          ];

          for (let i = 0; i < check1.length; i++) {
            FabricUtils.checkHorizontalSnap(this.instance!, this.artboard!, lineH!, check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            FabricUtils.checkVerticalSnap(this.instance!, this.artboard!, lineV!, check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
          }
        }
      }
    });
  }

  private onResetGuidelines() {
    const lineV = this.instance?.getItemByName("line_v");
    const lineH = this.instance?.getItemByName("line_h");
    if (!lineH || !lineV) return;
    lineH.opacity = 0;
    lineV.opacity = 0;
  }

  private onUpdateSelection() {
    const selection = this.instance?.getActiveObject();

    if (FabricUtils.isActiveSelection(this.selected)) {
      const objects = this.selected.objects.map((object) => this.instance?.getItemByName(object.name)).filter(Boolean) as fabric.Object[];
      objects.forEach((object) => object.set({ hasBorders: true, hasControls: true }));
    }

    if (FabricUtils.isActiveSelection(selection)) {
      const objects = selection._objects;
      objects.forEach((object) => object.set({ hasBorders: false, hasControls: false }));
    }

    this.selected = selection?.toObject(propertiesToInclude);
    this.instance?.requestRenderAll();
  }

  private onUpdateViewportTransform() {
    if (!this.instance) return;
    this.viewportTransform = [...this.instance.viewportTransform!];
    this.instance.requestRenderAll();
  }

  private onCenterArtboard() {
    if (!this.instance || !this.artboard) return;

    const center = this.instance.getCenter();

    this.instance.setViewportTransform(fabric.iMatrix.concat());
    this.instance.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);

    const artboardCenter = this.artboard.getCenterPoint();
    const viewportTransform = this.instance.viewportTransform!;

    viewportTransform[4] = this.instance.width! / 2 - artboardCenter.x * viewportTransform[0];
    viewportTransform[5] = this.instance.height! / 2 - artboardCenter.y * viewportTransform[3];

    this.viewportTransform = [...viewportTransform];
    this.instance.setViewportTransform(viewportTransform);
    this.instance.requestRenderAll();
  }

  private onInitializeWorkspaceObserver(workspace: HTMLDivElement) {
    const resizeObserver = createInstance(
      ResizeObserver,
      throttle(() => {
        this.instance!.setHeight(workspace.offsetHeight);
        this.instance!.setWidth(workspace.offsetWidth);
        this.onCenterArtboard();
        this.instance!.requestRenderAll();
      }, 50),
    );
    resizeObserver.observe(workspace);
  }

  private onInitializeElementMeta(object: fabric.Object, props?: Record<string, any>) {
    object.meta = {
      duration: 5000,
      offset: 0,
      ...(object.meta || {}),
    };
    if (!props) return;
    for (const key in props) {
      object.meta[key] = props[key];
    }
  }

  private onInitializeElementAnimation(object: fabric.Object) {
    object.anim = {
      in: {
        name: "none",
        duration: 0,
      },
      out: {
        name: "none",
        duration: 0,
      },
    };
  }

  private onInitializeEvents() {
    if (!this.instance) return;

    this.instance.on("object:added", (event) => {
      this.onAddElement(event.target);
    });

    this.instance.on("object:moving", (event) => {
      this.onSnapToGuidelines(event);
      this.onToggleControls(event.target!, false);
    });

    this.instance.on("object:scaling", (event) => {
      this.onToggleControls(event.target!, false);
      if (event.target!.type === "textbox") {
        const textbox = event.target as fabric.Textbox;
        textbox.set({ fontSize: Math.round(textbox.fontSize! * textbox.scaleY!), width: textbox.width! * textbox.scaleX!, scaleY: 1, scaleX: 1 });
      }
    });

    this.instance.on("object:resizing", (event) => {
      this.onToggleControls(event.target!, false);
    });

    this.instance.on("object:rotating", (event) => {
      if (event.e.shiftKey) event.target!.set({ snapAngle: 45 });
      else event.target!.set({ snapAngle: undefined });
      this.onToggleControls(event.target!, false);
    });

    this.instance.on("object:modified", (event) => {
      this.onResetGuidelines();
      this.onUpdateElement(event.target);
      this.onToggleControls(event.target!, true);
    });

    this.instance.on("object:removed", () => {
      this.onRefreshElements();
    });

    this.instance.on("selection:created", () => {
      this.onUpdateSelection();
    });

    this.instance.on("selection:updated", () => {
      this.onUpdateSelection();
    });

    this.instance.on("selection:cleared", () => {
      this.onUpdateSelection();
    });

    this.instance.on("mouse:wheel", (event) => {
      event.e.preventDefault();
      event.e.stopPropagation();

      if (event.e.ctrlKey) {
        if (!this.instance || !this.artboard) return;

        let zoom = this.instance.getZoom();
        zoom *= 0.999 ** (event.e.deltaY * 5);

        if (zoom > 2.5) zoom = 2.5;
        if (zoom < 0.01) zoom = 0.01;

        const center = this.instance.getCenter();
        this.onUpdateZoom(zoom);

        this.instance.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);
        this.instance.requestRenderAll();
        this.onUpdateViewportTransform();
      }
    });

    this.instance.on("mouse:dblclick", (event) => {
      switch (event.target?.type) {
        case "video":
        case "image":
          if (this.crop === event.target || event.target.meta?.placeholder) return;
          this.onCropImageStart(event.target as fabric.Image);
          break;
      }
    });
  }

  onInitializeMainCanvas(element: HTMLCanvasElement, workspace: HTMLDivElement) {
    const width = workspace.offsetWidth;
    const height = workspace.offsetHeight;

    this.instance = createInstance(fabric.Canvas, element, { height, width, stateful: true, centeredRotation: true, backgroundColor: "#F0F0F0", preserveObjectStacking: true, controlsAboveOverlay: true });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", height: this.height, width: this.width, fill: this.fill, rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default" });

    this.instance.selectionColor = "rgba(46, 115, 252, 0.11)";
    this.instance.selectionBorderColor = "rgba(98, 155, 255, 0.81)";
    this.instance.selectionLineWidth = 1.5;

    this.instance.add(this.artboard);
    this.instance.clipPath = this.artboard;
    this.zoom = 0.5;

    this.onCenterArtboard();
    this.onInitializeGuidelines();
    this.onInitializeEvents();
    this.onInitializeWorkspaceObserver(workspace);
    this.instance.requestRenderAll();
  }

  onInitializeRecorderCanvas(element: HTMLCanvasElement) {
    this.recorder = createInstance(fabric.StaticCanvas, element, { height: this.height, width: this.width, backgroundColor: this.fill });
  }

  onToggleCanvasElements(ms: number, canvas = this.instance as fabric.Canvas | fabric.StaticCanvas) {
    if (!canvas) return;

    for (const object of canvas._objects) {
      if (this.isElementExcluded(object)) continue;

      const hidden = object.meta!.offset > ms || object.meta!.offset + object.meta!.duration < ms;
      object.visible = !hidden;

      if (FabricUtils.isVideoElement(object) && !object.meta!.placeholder) {
        if (this.playing) {
          if (hidden && object.playing) object.pause();
          if (!hidden && !object.playing) object.play();
        } else {
          if (object.playing) object.pause();
          object.seek((ms - object.meta!.offset) / 1000);
        }
      }
    }

    canvas.requestRenderAll();
  }

  *onInitializeRecordTimeline() {
    if (!this.instance || !this.recorder || !this.artboard) return;

    this.recorder.setDimensions({ height: this.height, width: this.width });
    this.recorder.clear();

    const artboard: fabric.Object = yield createPromise<fabric.Object>((resolve) => this.artboard!.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
    this.recorder.add(artboard);

    for (const object of this.instance._objects) {
      if (this.isElementExcluded(object)) continue;
      const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
      this.recorder.add(clone);
    }

    this.recorder.renderAll();

    this.timeline = anime.timeline({
      duration: this.duration,
      loop: false,
      autoplay: false,
      update: this.recorder!.requestRenderAll.bind(this.recorder),
    });
  }

  onInitializeAnimationTimeline() {
    this.timeline = anime.timeline({
      duration: this.duration,
      autoplay: false,
      loop: this.loop,
      begin: (anim) => {
        this.onChangeSeekTime(anim.currentTime / 1000);
      },
      update: (anim) => {
        if (anim.currentTime >= this.duration) {
          this.onResetAudioTimeline();
          if (anim.loop) {
            anim.pause();
            anim.seek(0);
            anim.play();
            this.onChangeSeekTime(0);
            this.onInitializeAudioTimeline();
          } else {
            this.onPauseTimeline(true);
          }
        } else {
          this.onChangeSeekTime(anim.currentTime / 1000);
        }
      },
      complete: () => {
        this.onUpdateTimelineStatus(false);
        this.onResetAnimationTimeline();
        this.onResetAudioTimeline();
        this.onChangeSeekTime(0);
      },
    });
  }

  onInitializeTimelineAnimations(canvas = this.instance as fabric.Canvas | fabric.StaticCanvas) {
    if (!canvas || !this.timeline) return;

    this.timeline.add({
      targets: canvas,
      duration: this.duration,
    });

    for (const object of canvas._objects) {
      if (this.isElementExcluded(object)) continue;

      object.anim!.state = { opacity: object.opacity, left: object.left, top: object.top, scaleX: object.scaleX, scaleY: object.scaleY, fill: object.fill, selectable: object.selectable };
      object.set({ selectable: false });

      const entry = object.anim!.in;
      const exit = object.anim!.out;

      switch (entry.name) {
        case "fade-in": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "slide-in-left": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              left: [object.left! - Math.min(object.getScaledWidth() / 2, 100), object.left!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "slide-in-right": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              left: [object.left! + Math.min(object.getScaledWidth() / 2, 100), object.left!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "rise-in-up": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! + Math.min(object.getScaledHeight() / 2, 50), object.top!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "rise-in-down": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! - Math.min(object.getScaledHeight() / 2, 50), object.top!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "pop-in": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! + object.getScaledHeight() / 4, object.top!],
              left: [object.left! + object.getScaledWidth() / 4, object.left!],
              scaleX: [object.scaleX! - 0.5, object.scaleX!],
              scaleY: [object.scaleY! - 0.5, object.scaleY],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
      }

      switch (exit.name) {
        case "fade-out": {
          this.timeline.add(
            {
              targets: object,
              opacity: 0,
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "slide-out-left": {
          this.timeline.add(
            {
              targets: object,
              opacity: 0,
              left: [object.left!, object.left! - Math.min(object.getScaledWidth() / 2, 100)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "slide-out-right": {
          this.timeline.add(
            {
              targets: object,
              opacity: 0,
              left: [object.left!, object.left! + Math.min(object.getScaledWidth() / 2, 100)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "rise-out-up": {
          this.timeline.add(
            {
              targets: object,
              opacity: 0,
              top: [object.top!, object.top! - Math.min(object.getScaledHeight() / 2, 50)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "sink-out-down": {
          this.timeline.add(
            {
              targets: object,
              opacity: 0,
              top: [object.top!, object.top! + Math.min(object.getScaledHeight() / 2, 50)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
      }
    }
  }

  onResetAnimationTimeline() {
    if (!this.instance) return;

    if (this.timeline) {
      anime.remove(this.timeline);
      this.timeline = null;
    }

    for (const object of this.instance._objects) {
      if (this.isElementExcluded(object)) continue;
      object.set({ ...(object.anim?.state || {}) });
    }
  }

  onInitializeAudioTimeline() {
    for (const audio of this.audios) {
      const gain = this.audioContext.createGain();
      const source = this.audioContext.createBufferSource();

      source.buffer = audio.buffer;
      gain.gain.value = audio.volume;

      gain.connect(this.audioContext.destination);
      source.connect(gain);

      audio.playing = true;
      audio.source = source;

      audio.source.start(this.audioContext.currentTime + audio.offset, audio.trim, audio.timeline);
      audio.source.addEventListener("ended", () => (audio.playing = false));
    }
  }

  onResetAudioTimeline() {
    for (const audio of this.audios) {
      audio.playing = false;
      audio.source.stop();
    }
  }

  *onStartRecordVideo() {
    if (!this.instance) return;

    this.trim = null;
    this.selected = null;
    this.playing = false;

    this.instance.discardActiveObject();
    yield this.onInitializeRecordTimeline();
    this.onInitializeTimelineAnimations(this.recorder);
  }

  onStopRecordVideo() {
    if (!this.recorder) return;

    if (this.timeline) {
      anime.remove(this.timeline);
      this.timeline = null;
    }

    this.recorder.clear();
  }

  onStartRecordAudio(context: OfflineAudioContext) {
    for (const audio of this.audios) {
      const gain = context.createGain();
      const source = context.createBufferSource();

      source.buffer = audio.buffer;
      gain.gain.value = audio.volume;
      audio.source = source;

      gain.connect(context.destination);
      source.connect(gain);
      source.start(context.currentTime + audio.offset, audio.trim, audio.timeline);
    }
  }

  onStopRecordAudio() {
    for (const audio of this.audios) {
      audio.source.stop();
    }
  }

  onStartTimeline(last?: boolean) {
    if (!this.instance || this.playing) return;

    this.instance.discardActiveObject();
    this.onInitializeAnimationTimeline();
    this.onInitializeTimelineAnimations();
    this.onInitializeAudioTimeline();

    this.trim = null;
    this.selected = null;
    this.playing = true;

    if (last) this.timeline!.seek(this.seek);
    this.timeline!.play();
  }

  onPauseTimeline(initial?: boolean) {
    if (!this.instance || !this.playing) return;

    this.playing = false;
    if (initial) this.seek = 0;
    this.timeline!.pause();

    this.onResetAudioTimeline();
    this.onResetAnimationTimeline();
    this.onToggleCanvasElements(this.seek);
  }

  onDeleteObject(object?: fabric.Object) {
    if (!this.instance || !object) return;
    this.instance.remove(object).requestRenderAll();
  }

  onDeleteActiveObject() {
    const selection = this.instance?.getActiveObject();
    if (!selection || !this.instance) return;
    if (FabricUtils.isActiveSelection(selection)) {
      selection.forEachObject((object) => this.onDeleteObject(object));
    } else {
      this.onDeleteObject(selection);
    }
    this.instance.discardActiveObject().requestRenderAll();
  }

  onUpdateDimensions({ height, width }: { height?: number; width?: number }) {
    if (!this.artboard || !this.instance) return;

    if (height) {
      this.height = height;
      this.artboard.set("height", height);
    }

    if (width) {
      this.width = width;
      this.artboard.set("width", width);
    }

    this.onCenterArtboard();
    this.instance.requestRenderAll();
  }

  onAddText(text: string, fontFamily: string, fontSize: number, fontWeight: number) {
    if (!this.artboard || !this.instance) return;

    const options = { name: FabricUtils.elementID("text"), fontFamily, fontWeight, fontSize, width: 500, objectCaching: false, textAlign: "center" };
    const textbox = createInstance(fabric.Textbox, text, options);

    this.onInitializeElementMeta(textbox);
    this.onInitializeElementAnimation(textbox);

    textbox.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");

    this.instance.add(textbox);
    this.instance.setActiveObject(textbox);

    this.instance.requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    return textbox;
  }

  *onAddAudioFromSource(url: string, name: string) {
    const response: Response = yield fetch(url);
    const data: ArrayBuffer = yield response.arrayBuffer();
    const buffer: AudioBuffer = yield this.audioContext.decodeAudioData(data);

    const id = FabricUtils.elementID("audio");
    const duration = buffer.duration;
    const timeline = Math.min(duration, this.duration / 1000);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const audio: EditorAudioElement = { id, buffer, url, timeline, name, duration, source, playing: false, trim: 0, offset: 0, volume: 1 };
    this.audios.push(audio);

    return audio;
  }

  *onAddImageFromSource(source: string) {
    if (!this.instance || !this.artboard) return;
    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.Image.fromURL(
        source,
        (image) => {
          if (!image._originalElement) return reject();

          image.scaleToHeight(500);
          image.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(image);
          this.onInitializeElementAnimation(image);

          this.instance!.add(image);
          this.instance!.setActiveObject(image);

          this.instance!.requestRenderAll();
          this.onToggleCanvasElements(this.seek);

          resolve(image);
        },
        { name: FabricUtils.elementID("image"), crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddImageWithThumbail(source: string, _thumbnail: HTMLImageElement) {
    if (!this.instance || !this.artboard) return;

    const id = FabricUtils.elementID("image");

    const thumbnail = createInstance(fabric.Image, _thumbnail, { name: id, crossOrigin: "anonymous", lockRotation: true });
    thumbnail.scaleToWidth(500).setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    this.onInitializeElementMeta(thumbnail, { placeholder: true });
    this.onInitializeElementAnimation(thumbnail);

    const props = { evented: false, selectable: false, originX: "center", originY: "center" };
    const overlay = createInstance(fabric.Rect, { name: "overlay_" + id, height: thumbnail.height, width: thumbnail.width, scaleX: thumbnail.scaleX, scaleY: thumbnail.scaleY, fill: "#000000", opacity: 0.25, ...props });
    const spinner = createInstance(fabric.Path, activityIndicator, { name: "overlay_" + id, fill: "", stroke: "#fafafa", strokeWidth: 4, ...props });

    overlay.setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");
    spinner.scaleToWidth(48).setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");

    this.instance.add(thumbnail).add(overlay).add(spinner);
    this.instance.setActiveObject(thumbnail);

    this.instance.requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    FabricUtils.objectSpinningAnimation(spinner);
    FabricUtils.bindObjectTransformToParent(thumbnail, [overlay, spinner]);

    const children = [{ object: overlay }, { object: spinner, skip: ["angle", "scaleX", "scaleY"] }];
    FabricUtils.updateObjectTransformToParent(thumbnail, children);

    thumbnail.on("moving", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));
    thumbnail.on("scaling", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));
    thumbnail.on("rotating", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));

    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.Image.fromURL(
        source,
        (image) => {
          if (!image._originalElement) {
            this.instance!.remove(thumbnail, overlay, spinner).requestRenderAll();
            return reject();
          }

          const scaleX = thumbnail.getScaledWidth() / image.getScaledWidth();
          const scaleY = thumbnail.getScaledHeight() / image.getScaledHeight();

          image.set({ scaleX, scaleY }).setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(image);
          this.onInitializeElementAnimation(image);

          this.instance!.add(image).remove(thumbnail, overlay, spinner);
          this.instance!.setActiveObject(image).requestRenderAll();

          this.onToggleCanvasElements(this.seek);
          resolve(image);
        },
        { name: id, crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromSource(source: string) {
    if (!this.instance || !this.artboard) return;
    return createPromise<fabric.Video>((resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!video || !video._originalElement) return reject();
          const element = video._originalElement as HTMLVideoElement;

          video.scaleToHeight(500);
          video.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.duration) });
          this.onInitializeElementAnimation(video);

          this.instance!.add(video);
          this.instance!.setActiveObject(video);

          this.instance!.requestRenderAll();
          this.onToggleCanvasElements(this.seek);

          resolve(video);
        },
        { name: FabricUtils.elementID("video"), crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoWithThumbail(source: string, _thumbnail: HTMLImageElement) {
    if (!this.instance || !this.artboard) return;

    const id = FabricUtils.elementID("video");

    const thumbnail = createInstance(fabric.Image, _thumbnail, { name: id, type: "video", crossOrigin: "anonymous", lockRotation: true });
    thumbnail.scaleToWidth(500).setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    this.onInitializeElementMeta(thumbnail, { placeholder: true });
    this.onInitializeElementAnimation(thumbnail);

    const props = { evented: false, selectable: false, originX: "center", originY: "center" };
    const overlay = createInstance(fabric.Rect, { name: "overlay_" + id, height: thumbnail.height, width: thumbnail.width, scaleX: thumbnail.scaleX, scaleY: thumbnail.scaleY, fill: "#000000", opacity: 0.25, ...props });
    const spinner = createInstance(fabric.Path, activityIndicator, { name: "overlay_" + id, fill: "", stroke: "#fafafa", strokeWidth: 4, ...props });

    overlay.setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");
    spinner.scaleToWidth(48).setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");

    this.instance.add(thumbnail).add(overlay).add(spinner);
    this.instance.setActiveObject(thumbnail);

    this.instance.requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    FabricUtils.objectSpinningAnimation(spinner);
    FabricUtils.bindObjectTransformToParent(thumbnail, [overlay, spinner]);

    const children = [{ object: overlay }, { object: spinner, skip: ["angle", "scaleX", "scaleY"] }];
    FabricUtils.updateObjectTransformToParent(thumbnail, children);

    thumbnail.on("moving", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));
    thumbnail.on("scaling", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));
    thumbnail.on("rotating", () => FabricUtils.updateObjectTransformToParent(thumbnail, children));

    return createPromise<fabric.Video>((resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!video || !video._originalElement) {
            this.instance!.remove(thumbnail, overlay, spinner).requestRenderAll();
            return reject();
          }

          const element = video._originalElement as HTMLVideoElement;
          const scaleX = thumbnail.getScaledWidth() / video.getScaledWidth();
          const scaleY = thumbnail.getScaledHeight() / video.getScaledHeight();

          video.set({ scaleX, scaleY }).setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.duration) });
          this.onInitializeElementAnimation(video);

          this.instance!.add(video).remove(thumbnail, overlay, spinner);
          this.instance!.setActiveObject(video).requestRenderAll();

          this.onToggleCanvasElements(this.seek);
          resolve(video);
        },
        { name: id, crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  onAddBasicShape(klass: string, params: any) {
    if (!this.instance || !this.artboard) return;

    const shape: fabric.Object = createInstance((fabric as any)[klass], { name: FabricUtils.elementID(klass), objectCaching: true, ...params });
    shape.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    this.onInitializeElementMeta(shape);
    this.onInitializeElementAnimation(shape);

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    return shape;
  }

  onAddAbstractShape(path: string, name = "shape") {
    if (!this.artboard || !this.instance) return;

    const options = { name: FabricUtils.elementID(name), objectCaching: true, fill: "#000000" };
    const shape = createInstance(fabric.Path, path, options);

    shape.scaleToHeight(500);
    shape.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    this.onInitializeElementMeta(shape);
    this.onInitializeElementAnimation(shape);

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    return shape;
  }

  onAddLine(points: number[], name = "line") {
    if (!this.artboard || !this.instance) return;

    const options = { name: FabricUtils.elementID(name), objectCaching: true, strokeWidth: 4, stroke: "#000000", hasBorders: false };
    const line = createInstance(fabric.Line, points, options);

    line.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    line.set({ controls: { mtr: fabric.Object.prototype.controls.mtr, mr: fabric.Object.prototype.controls.mr, ml: fabric.Object.prototype.controls.ml } });

    this.onInitializeElementMeta(line);
    this.onInitializeElementAnimation(line);

    this.instance.add(line);
    this.instance.setActiveObject(line).requestRenderAll();
    this.onToggleCanvasElements(this.seek);

    return line;
  }

  onSelectAudio(audio: EditorAudioElement | null) {
    if (!audio) return (this.selected = null);
    this.instance!.discardActiveObject().requestRenderAll();
    this.selected = Object.assign({ type: "audio" }, audio) as unknown as fabric.Object;
  }

  onDeleteAudio(id: string) {
    const index = this.audios.findIndex((audio) => audio.id === id);
    if (index === -1) return;
    const audio = this.audios[index];
    this.audios.splice(index, 1);
    if (this.selected?.id === audio.id) this.selected = null;
    if (this.trim?.selected.id === audio.id) this.trim = null;
  }

  onSelectGroup(group: string[]) {
    if (!this.instance || !group.length) return;
    const elements = group.map((item) => this.instance!.getItemByName(item)).filter(Boolean) as fabric.Object[];
    const activeSelection = createInstance(fabric.ActiveSelection, elements, { canvas: this.instance });
    this.instance.setActiveObject(activeSelection);
  }

  onCreateSelection(name: string, multiple?: boolean) {
    if (!this.instance) return;

    const selected = this.instance.getActiveObject();
    const object = this.instance.getItemByName(name);

    if (!object) return;

    if (!selected || !multiple) {
      this.instance.setActiveObject(object);
    } else {
      if (FabricUtils.isActiveSelection(selected)) {
        if (object.group === selected) {
          if (selected._objects.length === 1) {
            this.instance.discardActiveObject();
          } else {
            selected.removeWithUpdate(object);
            this.instance.fire("selection:updated");
          }
        } else {
          selected.addWithUpdate(object);
          this.instance.fire("selection:updated");
        }
      } else {
        if (selected.name !== object.name) {
          const activeSelection = createInstance(fabric.ActiveSelection, [selected, object], { canvas: this.instance });
          this.instance.setActiveObject(activeSelection);
        }
      }
    }
    this.instance.requestRenderAll();
  }

  onCropImageStart(image: fabric.Image) {
    if (!this.instance || !this.artboard) return;

    this.onUpdateCrop(image);
    const element = image._originalElement as HTMLImageElement | HTMLVideoElement;

    const props = { top: image.top, left: image.left, angle: image.angle, width: image.getScaledWidth(), height: image.getScaledHeight(), lockRotation: true };
    const crop = createInstance(fabric.Cropper, { name: "crop_" + image.name, fill: "#ffffff", globalCompositeOperation: "overlay", ...props });
    const overlay = createInstance(fabric.Rect, { name: "overlay_" + image.name, selectable: false, fill: "#00000080", ...props });

    const verticals = Array.from({ length: 3 }, (_, index) => {
      const x = crop.left! + crop.width! * 0.25 * (index + 1);
      const line = createInstance(fabric.Line, [x, crop.top!, x, crop.top! + crop.height!], { name: `crop_v_${index}_${image.name}`, stroke: "#ffffff", selectable: false, evented: false });
      this.instance!.add(line);
      return line;
    });

    const horizontals = Array.from({ length: 3 }, (_, index) => {
      const y = crop.top! + crop.height! * 0.25 * (index + 1);
      const line = createInstance(fabric.Line, [crop.left!, y, crop.left! + crop.width!, y], { name: `crop_h_${index}_${image.name}`, stroke: "#ffffff", selectable: false, evented: false });
      this.instance!.add(line);
      return line;
    });

    const clipPath = image.clipPath;
    image.set({ clipPath: undefined });

    const width = image.width!;
    const height = image.height!;

    const cropX = image.cropX!;
    const cropY = image.cropY!;

    const elementWidth = isVideoElement(element) ? element.videoWidth : element.naturalWidth;
    const elementHeight = isVideoElement(element) ? element.videoHeight : element.naturalHeight;

    image.set({ cropX: 0, cropY: 0, dirty: false, selectable: false, left: image.left! - cropX * image.scaleX!, top: image.top! - cropY * image.scaleY!, width: elementWidth, height: elementHeight });
    crop.set({ left: image.left! + cropX * image.scaleX!, top: image.top! + cropY * image.scaleY!, width: width * image.scaleX!, height: height * image.scaleY!, dirty: false });
    overlay.set({ left: image.left, top: image.top, width: image.width! * image.scaleX!, height: image.height! * image.scaleY!, dirty: false });

    this.instance.add(overlay);
    this.instance.add(crop);

    this.instance.discardActiveObject();
    this.instance.setActiveObject(crop);
    this.instance.requestRenderAll();

    crop.on("moving", () => {
      if (crop.top! <= image.top!) crop.set({ top: image.top! });
      if (crop.left! <= image.left!) crop.set({ left: image.left! });

      if (crop.top! + crop.getScaledHeight() >= image.top! + image.getScaledHeight()) crop.set({ top: image.top! + image.getScaledHeight() - crop.getScaledHeight() });
      if (crop.left! + crop.getScaledWidth() >= image.left! + image.getScaledWidth()) crop.set({ left: image.left! + image.getScaledWidth() - crop.getScaledWidth() });

      verticals.map((vertical, index) =>
        vertical.set({ x1: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y1: crop.top!, x2: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y2: crop.top! + crop.getScaledHeight() }),
      );
      horizontals.map((vertical, index) =>
        vertical.set({ x1: crop.left!, y1: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1), x2: crop.left! + crop.getScaledWidth(), y2: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1) }),
      );

      this.instance!.requestRenderAll();
    });

    crop.on("scaling", () => {
      verticals.map((vertical, index) =>
        vertical.set({ x1: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y1: crop.top!, x2: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y2: crop.top! + crop.getScaledHeight() }),
      );
      horizontals.map((vertical, index) =>
        vertical.set({ x1: crop.left!, y1: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1), x2: crop.left! + crop.getScaledWidth(), y2: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1) }),
      );
    });

    crop.on("mouseup", () => {
      if (crop.left! < image.left!) {
        const offsetX = image.left! - crop.left!;
        const scaleX = offsetX / crop.width!;
        crop.set({ left: image.left, scaleX: crop.scaleX! - scaleX });
      }

      if (crop.top! < image.top!) {
        const offsetY = image.top! - crop.top!;
        const scaleY = offsetY / crop.height!;
        crop.set({ top: image.top, scaleY: crop.scaleY! - scaleY });
      }

      if (crop.left! + crop.getScaledWidth() > image.left! + image.getScaledWidth()) {
        const offsetX = crop.left! + crop.getScaledWidth() - (image.left! + image.getScaledWidth());
        const scaleX = offsetX / crop.width!;
        crop.set({ scaleX: Math.abs(crop.scaleX! - scaleX) });
      }

      if (crop.top! + crop.getScaledHeight() > image.top! + image.getScaledHeight()) {
        const offsetY = crop.top! + crop.getScaledHeight() - (image.top! + image.getScaledHeight());
        const scaleY = offsetY / crop.height!;
        crop.set({ scaleY: Math.abs(crop.scaleY! - scaleY) });
      }

      verticals.map((vertical, index) =>
        vertical.set({ x1: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y1: crop.top!, x2: crop.left! + crop.getScaledWidth() * 0.25 * (index + 1), y2: crop.top! + crop.getScaledHeight() }),
      );
      horizontals.map((vertical, index) =>
        vertical.set({ x1: crop.left!, y1: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1), x2: crop.left! + crop.getScaledWidth(), y2: crop.top! + crop.getScaledHeight() * 0.25 * (index + 1) }),
      );
    });

    crop.on("deselected", () => {
      image.set({ clipPath });
      this.onCropImageEnd(crop, image);
      this.onUpdateCrop(null);
      this.instance!.remove(overlay, ...verticals, ...horizontals).requestRenderAll();
    });
  }

  onCropImageEnd(crop: fabric.Rect, image: fabric.Image) {
    if (!this.instance || !this.artboard) return;

    const cropX = (crop.left! - image.left!) / image.scaleX!;
    const cropY = (crop.top! - image.top!) / image.scaleY!;
    const width = (crop.width! * crop.scaleX!) / image.scaleX!;
    const height = (crop.height! * crop.scaleY!) / image.scaleY!;

    image.set({ cropX: cropX, cropY: cropY, width: width, height: height, top: image.top! + cropY * image.scaleY!, left: image.left! + cropX * image.scaleX!, selectable: true });
    image.setCoords();

    this.instance.remove(crop);
    this.instance.renderAll();
  }

  onTrimAudioStart(audio: EditorAudioElement) {
    this.trim = Object.assign({ type: "audio" as "audio" }, { selected: audio });
  }

  onTrimAudioEnd() {
    this.trim = null;
  }

  onTrimVideoStart(video: fabric.Video) {
    this.trim = Object.assign({ type: "video" as "video" }, { selected: video.toObject(propertiesToInclude) });
    video.on("deselected", () => this.onTrimVideoEnd());
  }

  onTrimVideoEnd() {
    const object = this.instance?.getItemByName(this.trim?.selected.name);
    this.trim = null;
    if (!this.instance || !FabricUtils.isVideoElement(object)) return;
    object.seek(this.seek);
    this.instance.requestRenderAll();
  }

  onAddClipPathToImage(image: fabric.Image, clipPath: fabric.Object) {
    if (!this.instance || !this.artboard) return;

    const index = this.instance._objects.findIndex((object) => object === image);
    if (index === -1) return;

    const height = image.getScaledHeight();
    const width = image.getScaledWidth();

    if (height > width) clipPath.scaleToWidth(width / 2);
    else clipPath.scaleToHeight(height / 2);

    clipPath.moveTo(index - 1);
    clipPath.set({ absolutePositioned: true }).setPositionByOrigin(image.getCenterPoint(), "center", "center");
    image.set({ clipPath: clipPath });

    const group = [clipPath.name, image.name];
    clipPath.meta!.group = group;
    image.meta!.group = group;

    this.onRefreshElements();
    this.instance.fire("object:modified", { target: image }).fire("object:modified", { target: clipPath }).requestRenderAll();
  }

  onAddClipPathToActiveImage(clipPath: fabric.Object) {
    const object = this.instance?.getActiveObject() as fabric.Image | fabric.Video;
    if (!object || !(object.type === "image" || object.type === "video")) return;
    this.onAddClipPathToImage(object, clipPath);
  }

  onRemoveFilterFromImage(image: fabric.Image, name: string) {
    if (!this.instance || !image || !(image.type === "image" || image.type === "video") || image.effects!.name !== name) return;

    image.effects!.name = null;
    image.effects!.intensity = null;

    if (image.effects!.start >= 0 && image.effects!.end >= 0) {
      image.filters!.splice(image.effects!.start, image.effects!.end);
    }

    image.effects!.end = null;
    image.effects!.start = null;

    image.applyFilters();
    this.instance.fire("object:modified", { target: image }).requestRenderAll();
  }

  onRemoveFilterFromActiveImage(name: string) {
    const image = this.instance?.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.onRemoveFilterFromImage(image, name);
  }

  onAddFilterToImage(image: fabric.Image, filter: fabric.IBaseFilter[], name: string, intensity: number) {
    if (!this.instance || !image || (image.effects!.name === name && image.effects!.intensity === intensity)) return;

    image.effects!.name = name;
    image.effects!.intensity = intensity;

    if (image.effects!.start >= 0 && image.effects!.end >= 0) {
      image.filters!.splice(image.effects!.start, image.effects!.end);
    }

    image.effects!.start = image.filters!.length;
    image.effects!.end = image.filters!.length + filter.length;

    image.filters!.push(...filter);
    image.applyFilters();

    this.instance.fire("object:modified", { target: image });
    this.instance.requestRenderAll();
  }

  onAddFilterToActiveImage(filter: fabric.IBaseFilter[], name: string, intensity: number) {
    const image = this.instance?.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.onAddFilterToImage(image, filter, name, intensity);
  }

  onRemoveAdjustmentFromImage(image: fabric.Image, name: string) {
    if (!this.instance || !image || !(image.type === "image" || image.type === "video") || !image.adjustments![name]) return;

    if (image.adjustments![name].index >= 0) image.filters!.splice(image.adjustments![name].index, 1);
    image.applyFilters();
    image.adjustments![name] = null;

    this.instance.fire("object:modified", { target: image });
    this.instance.requestRenderAll();
  }

  onRemoveAdjustmentFromActiveImage(name: string) {
    const image = this.instance?.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.onRemoveAdjustmentFromImage(image, name);
  }

  onApplyAdjustmentsToImage(image: fabric.Image, filter: fabric.IBaseFilter, name: string, intensity: number) {
    if (!this.instance || !image || !(image.type === "image" || image.type === "video")) return;

    if (!image.adjustments![name]) image.adjustments![name] = {};
    const adjustment = image.adjustments![name];

    if (adjustment.name === name && adjustment.intensity === intensity) return;

    adjustment.name = name;
    adjustment.intensity = intensity;

    if (adjustment.index >= 0) image.filters!.splice(adjustment.index, 1);
    adjustment.index = image.filters!.length;

    image.filters!.push(filter);
    image.applyFilters();

    this.instance.fire("object:modified", { target: image });
    this.instance.requestRenderAll();
  }

  onApplyAdjustmentToActiveImage(filter: fabric.IBaseFilter, name: string, intensity: number) {
    const image = this.instance?.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.onApplyAdjustmentsToImage(image, filter, name, intensity);
  }

  onChangeObjectTimelineProperty(object: fabric.Object, property: string, value: number) {
    if (!object || !this.instance) return;

    if (!object.meta) object.meta = {};
    object.meta[property] = value;
    this.onToggleCanvasElements(this.seek);

    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectTimelineProperty(property: string, value: any) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectTimelineProperty(selected, property, value);
  }

  onChangeObjectProperty(object: fabric.Object, property: keyof fabric.Object, value: any) {
    if (!this.instance || !object) return;
    object.set(property, value);
    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectProperty(property: keyof fabric.Object, value: any) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectProperty(selected, property, value);
  }

  onChangeObjectFillGradient(object: fabric.Object, type: string, colors: fabric.IGradientOptionsColorStops) {
    if (!this.instance || !object) return;

    const gradient = createInstance(fabric.Gradient, { type: type, gradientUnits: "percentage", colorStops: colors, coords: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    object.set({ fill: gradient });

    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectFillGradient(type: string, colors: fabric.IGradientOptionsColorStops) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectFillGradient(selected, type, colors);
  }

  onChangeObjectAnimation(object: fabric.Object, type: "in" | "out", animation: EntryAnimation | ExitAnimation) {
    if (!this.instance || !object) return;
    object.anim![type].name = animation;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
    this.onToggleCanvasElements(this.seek);
  }

  onChangActiveObjectAnimation(type: "in" | "out", animation: EntryAnimation | ExitAnimation) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectAnimation(selected, type, animation);
  }

  onChangeObjectAnimationDuration(object: fabric.Object, type: "in" | "out", duration: number) {
    if (!this.instance || !object) return;
    object.anim![type].duration = duration;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
    this.onToggleCanvasElements(this.seek);
  }

  onChangeObjectAnimationEasing(object: fabric.Object, type: "in" | "out", easing: any) {
    if (!this.instance || !object) return;
    object.anim![type].easing = easing;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
    this.onToggleCanvasElements(this.seek);
  }

  onChangActiveObjectAnimationEasing(type: "in" | "out", easing: any) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectAnimationEasing(selected, type, easing);
  }

  onChangActiveObjectAnimationDuration(type: "in" | "out", duration: number) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectAnimationDuration(selected, type, duration);
  }

  onChangeTextboxProperty(textbox: fabric.Textbox, property: keyof fabric.Textbox, value: any, selection = false) {
    if (!this.instance || textbox.type !== "textbox") return;
    if (selection) {
      alert("TODO: Add styles for the specific selection element");
    } else {
      textbox.set(property, value);
    }
    this.instance.fire("object:modified", { target: textbox });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxProperty(property: keyof fabric.Textbox, value: any, selection = false) {
    const selected = this.instance?.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    this.onChangeTextboxProperty(selected, property, value, selection);
  }

  onChangeImageProperty(image: fabric.Image, property: keyof fabric.Image, value: any) {
    if (!this.instance || !(image.type === "image" || image.type === "video")) return;
    image.set(property, value);
    this.instance.fire("object:modified", { target: image });
    this.instance.requestRenderAll();
  }

  onChangeActiveImageProperty(property: keyof fabric.Image, value: any) {
    const selected = this.instance?.getActiveObject() as fabric.Image | null;
    if (!this.instance || !selected || selected.type !== "image") return;
    this.onChangeImageProperty(selected, property, value);
  }

  onChangeVideoProperty(video: fabric.Video, property: keyof fabric.Video, value: any) {
    if (!this.instance || video.type !== "video") return;
    video.set(property, value);
    this.instance.fire("object:modified", { target: video });
    this.instance.requestRenderAll();
  }

  onChangeActiveVideoProperty(property: keyof fabric.Video, value: any) {
    const selected = this.instance?.getActiveObject() as fabric.Video | null;
    if (!this.instance || !selected || selected.type !== "video") return;
    this.onChangeVideoProperty(selected, property, value);
  }

  onChangeAudioProperties(id: string, value: Partial<EditorAudioElement>) {
    const index = this.audios.findIndex((audio) => audio.id === id);
    const audio = this.audios[index];
    const updated = { ...audio, ...value };
    this.audios[index] = updated;
    if (!this.selected || this.selected.type !== "audio" || this.selected.id !== id) return;
    this.selected = Object.assign({ type: "audio" }, updated) as unknown as fabric.Object;
  }

  onChangeObjectLayer(element: fabric.Object, type: "up" | "down" | "top" | "bottom") {
    if (!element || !this.instance) return;

    const index = this.instance._objects.findIndex((object) => object === element);
    switch (type) {
      case "up":
        if (index === this.instance._objects.length - 1) return;
        const top = [...this.instance._objects].slice(index + 1).findIndex((object) => !elementsToExclude.includes(object.name!));
        this.instance.moveTo(element, index + top + 1);
        break;
      case "down":
        if (index === minLayerStack) return;
        const bottom = [...this.instance._objects].slice(minLayerStack + 1, index).findIndex((object) => !elementsToExclude.includes(object.name!));
        this.instance.moveTo(element, minLayerStack + bottom);
        break;
      case "top":
        this.instance.moveTo(element, this.instance._objects.length);
        break;
      case "bottom":
        this.instance.moveTo(element, minLayerStack);
        break;
    }

    this.onRefreshElements();
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectLayer(type: "up" | "down" | "top" | "bottom") {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onChangeObjectLayer(selected, type);
  }

  onAlignObjectToPage(element: fabric.Object, type: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    if (!element || !this.instance || !this.artboard) return;

    const elementCenter = element.getCenterPoint();
    const artboardCenter = this.artboard.getCenterPoint();

    switch (type) {
      case "left":
        element.setPositionByOrigin(createInstance(fabric.Point, this.artboard.left!, elementCenter.y), "left", "center");
        break;
      case "center":
        element.setPositionByOrigin(createInstance(fabric.Point, artboardCenter.x!, elementCenter.y), "center", "center");
        break;
      case "right":
        element.setPositionByOrigin(createInstance(fabric.Point, this.artboard.left! + this.artboard.width!, elementCenter.y), "right", "center");
        break;
      case "top":
        element.setPositionByOrigin(createInstance(fabric.Point, elementCenter.x, this.artboard.top!), "center", "top");
        break;
      case "middle":
        element.setPositionByOrigin(createInstance(fabric.Point, elementCenter.x, artboardCenter.y), "center", "center");
        break;
      case "bottom":
        element.setPositionByOrigin(createInstance(fabric.Point, elementCenter.x, this.artboard.top! + this.artboard.height!), "center", "bottom");
        break;
    }

    element.setCoords();
    this.instance.fire("object:modified", { target: element });
    this.instance.requestRenderAll();
  }

  onAlignActiveObjectToPage(type: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    this.onAlignObjectToPage(selected, type);
  }

  onChangeZoom(zoom: number) {
    this.zoom = zoom;
    if (!this.instance) return;
    const center = this.instance.getCenter();
    this.instance.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);
  }

  onChangeSeekTime(seek: number) {
    this.seek = seek * 1000;
    this.onToggleCanvasElements(this.seek);
  }

  onToggleLoop(loop: boolean) {
    this.loop = loop;
    if (this.timeline) this.timeline.loop = loop;
  }

  onChangeDuration(duration: number) {
    this.duration = duration * 1000;
    if (this.timeline) this.timeline.duration = this.duration;
  }
}
