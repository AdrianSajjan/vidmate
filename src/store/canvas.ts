import { EntryAnimation, ExitAnimation } from "canvas";
import { fabric } from "fabric";
import { floor } from "lodash";
import { makeAutoObservable } from "mobx";

import { CanvasCropper } from "@/plugins/crop";
import { CanvasGuidelines } from "@/plugins/guidelines";
import { CanvasHistory } from "@/plugins/history";
import { CanvasTimeline } from "@/plugins/timeline";
import { CanvasWorkspace } from "@/plugins/workspace";

import { activityIndicator, propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise } from "@/lib/utils";
import { EditorAudioElement, EditorTrim } from "@/types/editor";

export const minLayerStack = 3;
export const canvasYPadding = 100;

export class Canvas {
  artboard?: fabric.Rect;
  instance?: fabric.Canvas;

  cropper!: CanvasCropper;
  history!: CanvasHistory;
  timeline!: CanvasTimeline;
  workspace!: CanvasWorkspace;

  audioContext: AudioContext;
  audios: EditorAudioElement[];

  elements: fabric.Object[];
  selected?: fabric.Object | null;
  controls: boolean;

  trim?: EditorTrim | null;

  constructor() {
    this.elements = [];
    this.controls = true;

    this.audios = [];
    this.audioContext = createInstance(AudioContext);

    makeAutoObservable(this);
  }

  private onRefreshElements() {
    if (!this.instance) return;
    this.elements = this.instance._objects.filter((object) => !FabricUtils.isElementExcluded(object)).map((object) => object.toObject(propertiesToInclude));
  }

  private onAddElement(object?: fabric.Object) {
    if (!object || FabricUtils.isElementExcluded(object)) return;
    this.elements.push(object.toObject(propertiesToInclude));
  }

  private onUpdateElement(object?: fabric.Object) {
    const index = this.elements.findIndex((element) => element.name === object?.name);
    if (index === -1 || !object) return;
    const element = object.toObject(propertiesToInclude);
    if (object.name === this.selected?.name) this.selected = element;
    if (object.name === this.trim?.selected.name) this.trim!.selected = element;
    this.elements[index] = element;
  }

  private onToggleControls(object: fabric.Object, enabled: boolean) {
    object.hasControls = enabled;
    this.controls = enabled;
  }

  private onUpdateSelection() {
    const selection = this.instance!.getActiveObject();

    if (FabricUtils.isActiveSelection(this.selected)) {
      const objects = this.selected.objects.map((object) => this.instance!.getItemByName(object.name)).filter(Boolean) as fabric.Object[];
      objects.forEach((object) => object.set({ hasBorders: true, hasControls: true }));
    }

    if (!selection || FabricUtils.isElementExcluded(selection)) {
      this.selected = null;
    } else if (FabricUtils.isActiveSelection(selection)) {
      selection.forEachObject((object) => object.set({ hasBorders: false, hasControls: false }));
      this.selected = selection.toObject(propertiesToInclude);
    } else {
      this.selected = selection.toObject(propertiesToInclude);
    }

    this.instance!.requestRenderAll();
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
  }

  onInitialize(element: HTMLCanvasElement, workspace: HTMLDivElement) {
    const props = { width: workspace.offsetWidth, height: workspace.offsetHeight, backgroundColor: "#F0F0F0", selectionColor: "#2e73fc1c", selectionBorderColor: "#629bffcf", selectionLineWidth: 1.5 };
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, preserveObjectStacking: true, controlsAboveOverlay: true, ...props });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default" });

    this.history = createInstance(CanvasHistory, this);
    this.cropper = createInstance(CanvasCropper, this);

    this.timeline = createInstance(CanvasTimeline, this);
    this.workspace = createInstance(CanvasWorkspace, this, workspace);

    this.onInitializeEvents();
    CanvasGuidelines.initializeAligningGuidelines(this.instance);

    this.instance.add(this.artboard);
    this.instance.clipPath = this.artboard;
    this.instance.renderAll();
  }

  onInitializeAudioTimeline() {
    for (const audio of this.audios) {
      if (audio.muted) continue;

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
      if (!audio.playing) continue;
      audio.playing = false;
      audio.source.stop();
    }
  }

  onStartRecordAudio(audios: EditorAudioElement[], context: OfflineAudioContext) {
    for (const audio of audios) {
      if (audio.muted) continue;

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

  onStopRecordAudio(audios: EditorAudioElement[]) {
    for (const audio of audios) {
      if (!audio.muted) continue;
      audio.source.stop();
    }
  }

  onDeleteObject(object?: fabric.Object) {
    if (!this.instance || !object) return;
    this.instance.remove(object).fire("").requestRenderAll();
  }

  onDeleteActiveObject() {
    const selection = this.instance?.getActiveObject();
    if (!selection || !this.instance) return;
    if (FabricUtils.isActiveSelection(selection)) {
      selection.forEachObject((object) => this.onDeleteObject(object));
    } else {
      this.onDeleteObject(selection);
    }
    this.onRefreshElements();
    this.instance.discardActiveObject().requestRenderAll();
  }

  onAddText(text: string, fontFamily: string, fontSize: number, fontWeight: number) {
    if (!this.artboard || !this.instance) return;

    const options = { name: FabricUtils.elementID("text"), fontFamily, fontWeight, fontSize, width: 500, objectCaching: false, textAlign: "center" };
    const textbox = createInstance(fabric.Textbox, text, options);
    textbox.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");

    this.onInitializeElementMeta(textbox);
    this.onInitializeElementAnimation(textbox);

    this.instance.add(textbox);
    this.instance.setActiveObject(textbox).requestRenderAll();

    return textbox;
  }

  *onAddAudioFromSource(url: string, name: string) {
    const response: Response = yield fetch(url);
    const data: ArrayBuffer = yield response.arrayBuffer();
    const buffer: AudioBuffer = yield this.audioContext.decodeAudioData(data);

    const id = FabricUtils.elementID("audio");
    const duration = buffer.duration;
    const timeline = Math.min(duration, this.timeline.duration / 1000);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const audio: EditorAudioElement = { id, buffer, url, timeline, name, duration, source, muted: false, playing: false, trim: 0, offset: 0, volume: 1 };
    this.audios.push(audio);

    return audio;
  }

  *onAddImageFromSource(source: string, options?: fabric.IImageOptions, skip?: boolean) {
    if (!this.instance || !this.artboard) return;
    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.Image.fromURL(
        source,
        (image) => {
          if (!image._originalElement) {
            return reject();
          }

          if (!skip) {
            image.scaleToHeight(500);
            image.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");
          }

          this.onInitializeElementMeta(image);
          this.onInitializeElementAnimation(image);

          this.instance!.add(image);
          this.instance!.setActiveObject(image).requestRenderAll();

          resolve(image);
        },
        { ...options, name: FabricUtils.elementID("image"), crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddImageFromThumbail(source: string, thumbnail: HTMLImageElement) {
    if (!this.instance || !this.artboard) return;

    const id = FabricUtils.elementID("image");
    const props = { evented: false, selectable: false, originX: "center", originY: "center", excludeFromExport: true };

    const image = createInstance(fabric.Image, thumbnail, { type: "video", crossOrigin: "anonymous", ...props });
    const overlay = createInstance(fabric.Rect, { fill: "#000000", opacity: 0.25, ...props });
    const spinner = createInstance(fabric.Path, activityIndicator, { fill: "", stroke: "#fafafa", strokeWidth: 4, ...props });

    image.scaleToWidth(500);
    overlay.set({ height: image.height, width: image.width, scaleX: image.scaleX, scaleY: image.scaleY });
    spinner.scaleToWidth(48);
    FabricUtils.objectSpinningAnimation(spinner);

    const placeholder = createInstance(fabric.Group, [image, overlay, spinner], { name: id, excludeFromExport: true });
    placeholder.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    this.instance.add(placeholder);
    this.instance.setActiveObject(placeholder).requestRenderAll();

    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.Image.fromURL(
        source,
        (image) => {
          if (!this.instance!.contains(placeholder)) {
            return;
          }

          if (!image._originalElement) {
            this.instance!.remove(placeholder).requestRenderAll();
            return reject();
          }

          image.set({ scaleX: placeholder.getScaledWidth() / image.getScaledWidth(), scaleY: placeholder.getScaledHeight() / image.getScaledHeight() });
          image.setPositionByOrigin(placeholder.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(image);
          this.onInitializeElementAnimation(image);

          this.instance!.remove(placeholder).add(image);
          this.instance!.setActiveObject(image).requestRenderAll();

          resolve(image);
        },
        { name: id, crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromSource(source: string, options?: fabric.IVideoOptions, skip?: boolean) {
    if (!this.instance || !this.artboard) return;
    return createPromise<fabric.Video>((resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!video || !video._originalElement) {
            return reject();
          }

          if (!skip) {
            video.scaleToHeight(500);
            video.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");
          }

          const element = video._originalElement as HTMLVideoElement;
          this.onInitializeElementMeta(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.timeline.duration) });
          this.onInitializeElementAnimation(video);

          this.instance!.add(video);
          this.instance!.setActiveObject(video).requestRenderAll();

          resolve(video);
        },
        { ...options, name: FabricUtils.elementID("video"), crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromThumbail(source: string, thumbnail: HTMLImageElement) {
    if (!this.instance || !this.artboard) return;

    const id = FabricUtils.elementID("video");
    const props = { evented: false, selectable: false, originX: "center", originY: "center", excludeFromExport: true };

    const image = createInstance(fabric.Image, thumbnail, { type: "video", crossOrigin: "anonymous", ...props });
    const overlay = createInstance(fabric.Rect, { fill: "#000000", opacity: 0.25, ...props });
    const spinner = createInstance(fabric.Path, activityIndicator, { fill: "", stroke: "#fafafa", strokeWidth: 4, ...props });

    image.scaleToWidth(500);
    overlay.set({ height: image.height, width: image.width, scaleX: image.scaleX, scaleY: image.scaleY });
    spinner.scaleToWidth(48);
    FabricUtils.objectSpinningAnimation(spinner);

    const placeholder = createInstance(fabric.Group, [image, overlay, spinner], { name: id, excludeFromExport: true });
    placeholder.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    this.instance.add(placeholder);
    this.instance.setActiveObject(placeholder).requestRenderAll();

    return createPromise<fabric.Video>((resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!this.instance!.contains(placeholder)) {
            return;
          }

          if (!video || !video._originalElement) {
            this.instance!.remove(placeholder).requestRenderAll();
            return reject();
          }

          const element = video._originalElement as HTMLVideoElement;
          video.set({ scaleX: placeholder.getScaledWidth() / video.getScaledWidth(), scaleY: placeholder.getScaledHeight() / video.getScaledHeight() });
          video.setPositionByOrigin(placeholder.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.timeline.duration) });
          this.onInitializeElementAnimation(video);

          this.instance!.remove(placeholder).add(video);
          this.instance!.setActiveObject(video).requestRenderAll();

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
    object.seek(this.timeline.seek);
    this.instance.requestRenderAll();
  }

  *onReplaceImageSource(image: fabric.Image, source: string) {
    if (!this.instance) return;

    const props = { evented: false, selectable: false, originX: "center", originY: "center", excludeFromExport: true };
    const overlay = createInstance(fabric.Rect, { name: "overlay_" + image.name, height: image.height, width: image.width, scaleX: image.scaleX, scaleY: image.scaleY, fill: "#000000", opacity: 0.25, ...props });
    const spinner = createInstance(fabric.Path, activityIndicator, { name: "overlay_" + image.name, fill: "", stroke: "#fafafa", strokeWidth: 4, ...props });

    overlay.setPositionByOrigin(image.getCenterPoint(), "center", "center");
    spinner.scaleToWidth(48).setPositionByOrigin(image.getCenterPoint(), "center", "center");

    image.meta!.replace = true;
    this.instance.add(overlay, spinner);
    this.instance.requestRenderAll();

    FabricUtils.objectSpinningAnimation(spinner);
    FabricUtils.bindObjectTransformToParent(image, [overlay, spinner]);

    const children = [{ object: overlay }, { object: spinner, skip: ["angle", "scaleX", "scaleY"] }];
    image.on("moving", () => FabricUtils.updateObjectTransformToParent(image, children));
    image.on("scaling", () => FabricUtils.updateObjectTransformToParent(image, children));
    image.on("rotating", () => FabricUtils.updateObjectTransformToParent(image, children));

    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.util.loadImage(
        source,
        (element) => {
          if (!element || !element.height || !element.width) return reject();

          image.setElement(element);
          image.meta!.replace = false;
          image.set({ scaleX: image.scaleX, scaleY: image.scaleY, left: image.left, top: image.top, angle: image.angle, cropX: image.cropX, cropY: image.cropY });

          image.off("moving");
          image.off("scaling");
          image.off("rotating");

          this.instance!.remove(overlay, spinner).requestRenderAll();
          resolve(image);
        },
        null,
        "anonymous",
      );
    });
  }

  *onReplaceActiveImageSource(source: string) {
    const object = this.instance?.getActiveObject() as fabric.Image;
    if (!object || object.type !== "image") return;
    this.onReplaceImageSource(object, source);
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
  }

  onChangeObjectAnimationEasing(object: fabric.Object, type: "in" | "out", easing: any) {
    if (!this.instance || !object) return;
    object.anim![type].easing = easing;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
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
        const top = [...this.instance._objects].slice(index + 1).findIndex((object) => !FabricUtils.isElementExcluded(object));
        this.instance.moveTo(element, index + top + 1);
        break;
      case "down":
        if (index === minLayerStack) return;
        const bottom = [...this.instance._objects].slice(minLayerStack + 1, index).findIndex((object) => !FabricUtils.isElementExcluded(object));
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
}
