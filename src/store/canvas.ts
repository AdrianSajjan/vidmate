import { fabric } from "fabric";
import { floor } from "lodash";
import { EntryAnimation, ExitAnimation } from "canvas";
import { makeAutoObservable, runInAction } from "mobx";

import { CanvasCropper } from "@/plugins/crop";
import { CanvasGuidelines } from "@/plugins/guidelines";
import { CanvasHistory } from "@/plugins/history";
import { CanvasTimeline } from "@/plugins/timeline";
import { CanvasWorkspace } from "@/plugins/workspace";
import { CanvasAudio } from "@/plugins/audio";
import { CanvasEffects } from "@/plugins/filters";
import { CanvasAlignment } from "@/plugins/alignment";
import { CanvasSelection } from "@/plugins/selection";

import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise } from "@/lib/utils";
import { EditorAudioElement, EditorTrim } from "@/types/editor";
import { activityIndicator, propertiesToInclude } from "@/fabric/constants";

export class Canvas {
  artboard!: fabric.Rect;
  instance!: fabric.Canvas;

  audio!: CanvasAudio;
  timeline!: CanvasTimeline;
  workspace!: CanvasWorkspace;

  trim: EditorTrim;
  effects!: CanvasEffects;
  cropper!: CanvasCropper;

  history!: CanvasHistory;
  selection!: CanvasSelection;
  alignment!: CanvasAlignment;

  controls: boolean;
  elements: fabric.Object[];

  constructor() {
    this.elements = [];
    this.trim = null;
    this.controls = true;
    makeAutoObservable(this);
  }

  private _refreshElements() {
    this.elements = this.instance._objects.filter((object) => !FabricUtils.isElementExcluded(object)).map((object) => object.toObject(propertiesToInclude));
  }

  private _toggleControls(object: fabric.Object, enabled: boolean) {
    object.hasControls = enabled;
    this.controls = enabled;
  }

  private _objectAddedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target || FabricUtils.isElementExcluded(event.target)) return;
      this.elements.push(event.target.toObject(propertiesToInclude));
    });
  }

  private _objectModifiedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target || FabricUtils.isElementExcluded(event.target)) return;
      const index = this.elements.findIndex((element) => element.name === event.target!.name);
      if (index === -1) return;
      const element = event.target.toObject(propertiesToInclude);
      this.elements[index] = element;
      if (event.target.name === this.trim?.selected.name) this.trim!.selected = element;
    });
  }

  private _objectDeletedEvent(_: fabric.IEvent) {
    this._refreshElements();
  }

  private _objectMovingEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target) return;
      this._toggleControls(event.target, false);
    });
  }

  private _objectScalingEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target) return;
      switch (event.target.type) {
        case "textbox":
          const textbox = event.target as fabric.Textbox;
          textbox.set({ fontSize: Math.round(textbox.fontSize! * textbox.scaleY!), width: textbox.width! * textbox.scaleX!, scaleY: 1, scaleX: 1 });
          break;
      }
      this._toggleControls(event.target, false);
    });
  }

  private _objectRotatingEvent(event: fabric.IEvent<MouseEvent>) {
    runInAction(() => {
      if (!event.target) return;
      if (event.e.shiftKey) event.target.set({ snapAngle: 45 });
      else event.target.set({ snapAngle: undefined });
      this._toggleControls(event.target, false);
    });
  }

  private _initEvents() {
    this.instance.on("object:added", this._objectAddedEvent.bind(this));
    this.instance.on("object:modified", this._objectModifiedEvent.bind(this));
    this.instance.on("object:removed", this._objectDeletedEvent.bind(this));

    this.instance.on("object:moving", this._objectMovingEvent.bind(this));
    this.instance.on("object:scaling", this._objectScalingEvent.bind(this));
    this.instance.on("object:rotating", this._objectRotatingEvent.bind(this));
  }

  initialize(element: HTMLCanvasElement, workspace: HTMLDivElement) {
    const props = { width: workspace.offsetWidth, height: workspace.offsetHeight, backgroundColor: "#F0F0F0", selectionColor: "#2e73fc1c", selectionBorderColor: "#629bffcf", selectionLineWidth: 1.5 };
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, preserveObjectStacking: true, controlsAboveOverlay: true, ...props });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default" });

    this.history = createInstance(CanvasHistory, this);
    this.workspace = createInstance(CanvasWorkspace, this, workspace);
    this.alignment = createInstance(CanvasAlignment, this);
    this.audio = createInstance(CanvasAudio, this);

    this.selection = createInstance(CanvasSelection, this);
    this.effects = createInstance(CanvasEffects, this);
    this.cropper = createInstance(CanvasCropper, this);
    this.timeline = createInstance(CanvasTimeline, this);

    this._initEvents();
    CanvasGuidelines.initializeAligningGuidelines(this.instance);

    this.instance.add(this.artboard);
    this.instance.clipPath = this.artboard;
    this.instance.renderAll();
  }

  onDeleteObject(object?: fabric.Object) {
    if (object) this.instance.remove(object).requestRenderAll();
  }

  onDeleteActiveObject() {
    const selection = this.instance.getActiveObject();
    if (FabricUtils.isActiveSelection(selection)) {
      this.instance.remove(...selection._objects);
    } else {
      if (selection) this.instance.remove(selection);
    }
    this.instance.discardActiveObject().requestRenderAll();
  }

  onAddText(text: string, fontFamily: string, fontSize: number, fontWeight: number) {
    const options = { name: FabricUtils.elementID("text"), fontFamily, fontWeight, fontSize, width: 500, objectCaching: false, textAlign: "center" };
    const textbox = createInstance(fabric.Textbox, text, options);

    textbox.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");
    FabricUtils.initializeMetaProperties(textbox);
    FabricUtils.initializeAnimationProperties(textbox);

    this.instance.add(textbox);
    this.instance.setActiveObject(textbox).requestRenderAll();
    return textbox;
  }

  *onAddImageFromSource(source: string, options?: fabric.IImageOptions, skip?: boolean) {
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

          FabricUtils.initializeMetaProperties(image);
          FabricUtils.initializeAnimationProperties(image);

          this.instance!.add(image);
          this.instance!.setActiveObject(image).requestRenderAll();

          resolve(image);
        },
        { ...options, name: FabricUtils.elementID("image"), crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddImageFromThumbail(source: string, thumbnail: HTMLImageElement) {
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

          FabricUtils.initializeMetaProperties(image);
          FabricUtils.initializeAnimationProperties(image);

          this.instance!.remove(placeholder).add(image);
          this.instance!.setActiveObject(image).requestRenderAll();

          resolve(image);
        },
        { name: id, crossOrigin: "anonymous", objectCaching: true, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromSource(source: string, options?: fabric.IVideoOptions, skip?: boolean) {
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
          FabricUtils.initializeMetaProperties(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.timeline.duration) });
          FabricUtils.initializeAnimationProperties(video);

          this.instance!.add(video);
          this.instance!.setActiveObject(video).requestRenderAll();

          resolve(video);
        },
        { ...options, name: FabricUtils.elementID("video"), crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromThumbail(source: string, thumbnail: HTMLImageElement) {
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

          FabricUtils.initializeMetaProperties(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.timeline.duration) });
          FabricUtils.initializeAnimationProperties(video);

          this.instance!.remove(placeholder).add(video);
          this.instance!.setActiveObject(video).requestRenderAll();

          resolve(video);
        },
        { name: id, crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  onAddBasicShape(klass: string, params: any) {
    const shape: fabric.Object = createInstance((fabric as any)[klass], { name: FabricUtils.elementID(klass), objectCaching: true, ...params });
    shape.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    FabricUtils.initializeMetaProperties(shape);
    FabricUtils.initializeAnimationProperties(shape);

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();

    return shape;
  }

  onAddAbstractShape(path: string, name = "shape") {
    const options = { name: FabricUtils.elementID(name), objectCaching: true, fill: "#000000" };
    const shape = createInstance(fabric.Path, path, options);

    shape.scaleToHeight(500);
    shape.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    FabricUtils.initializeMetaProperties(shape);
    FabricUtils.initializeAnimationProperties(shape);

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();

    return shape;
  }

  onAddLine(points: number[], name = "line") {
    const options = { name: FabricUtils.elementID(name), objectCaching: true, strokeWidth: 4, stroke: "#000000", hasBorders: false };
    const line = createInstance(fabric.Line, points, options);

    line.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    line.set({ controls: { mtr: fabric.Object.prototype.controls.mtr, mr: fabric.Object.prototype.controls.mr, ml: fabric.Object.prototype.controls.ml } });

    FabricUtils.initializeMetaProperties(line);
    FabricUtils.initializeAnimationProperties(line);

    this.instance.add(line);
    this.instance.setActiveObject(line).requestRenderAll();

    return line;
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
    const object = this.instance.getItemByName(this.trim?.selected.name);
    this.trim = null;
    if (!FabricUtils.isVideoElement(object)) return;
    object.seek(this.timeline.seek);
    this.instance.requestRenderAll();
  }

  *onReplaceImageSource(image: fabric.Image, source: string) {
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
    const object = this.instance.getActiveObject() as fabric.Image;
    if (!object || object.type !== "image") return;
    this.onReplaceImageSource(object, source);
  }

  onAddClipPathToImage(image: fabric.Image, clipPath: fabric.Object) {
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

    this.instance.requestRenderAll();
    this._refreshElements();
  }

  onAddClipPathToActiveImage(clipPath: fabric.Object) {
    const object = this.instance.getActiveObject() as fabric.Image | fabric.Video;
    if (!object || !(object.type === "image" || object.type === "video")) return;
    this.onAddClipPathToImage(object, clipPath);
  }

  onChangeObjectTimelineProperty(object: fabric.Object, property: string, value: number) {
    if (!object || !object.meta) return;
    object.meta[property] = value;
    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectTimelineProperty(property: string, value: any) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectTimelineProperty(selected, property, value);
  }

  onChangeObjectProperty(object: fabric.Object, property: keyof fabric.Object, value: any) {
    if (!object) return;
    object.set(property, value);
    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectProperty(property: keyof fabric.Object, value: any) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectProperty(selected, property, value);
  }

  onChangeObjectFillGradient(object: fabric.Object, type: string, colors: fabric.IGradientOptionsColorStops) {
    if (!object) return;
    const gradient = createInstance(fabric.Gradient, { type: type, gradientUnits: "percentage", colorStops: colors, coords: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    object.set({ fill: gradient });
    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectFillGradient(type: string, colors: fabric.IGradientOptionsColorStops) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectFillGradient(selected, type, colors);
  }

  onChangeObjectAnimation(object: fabric.Object, type: "in" | "out", animation: EntryAnimation | ExitAnimation) {
    if (!object) return;
    object.anim![type].name = animation;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangActiveObjectAnimation(type: "in" | "out", animation: EntryAnimation | ExitAnimation) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimation(selected, type, animation);
  }

  onChangeObjectAnimationDuration(object: fabric.Object, type: "in" | "out", duration: number) {
    if (!object) return;
    object.anim![type].duration = duration;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangeObjectAnimationEasing(object: fabric.Object, type: "in" | "out", easing: any) {
    if (!object) return;
    object.anim![type].easing = easing;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangActiveObjectAnimationEasing(type: "in" | "out", easing: any) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimationEasing(selected, type, easing);
  }

  onChangActiveObjectAnimationDuration(type: "in" | "out", duration: number) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimationDuration(selected, type, duration);
  }

  onChangeTextboxProperty(textbox: fabric.Textbox, property: keyof fabric.Textbox, value: any, _selection = false) {
    if (textbox.type !== "textbox") return;
    textbox.set(property, value);
    if (property === "textTransform") textbox.set("text", textbox.text);
    this.instance.fire("object:modified", { target: textbox });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxProperty(property: keyof fabric.Textbox, value: any, selection = false) {
    const selected = this.instance.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    this.onChangeTextboxProperty(selected, property, value, selection);
  }

  onChangeImageProperty(image: fabric.Image, property: keyof fabric.Image, value: any) {
    if (!(image.type === "image" || image.type === "video")) return;
    image.set(property, value);
    this.instance.fire("object:modified", { target: image });
    this.instance.requestRenderAll();
  }

  onChangeActiveImageProperty(property: keyof fabric.Image, value: any) {
    const selected = this.instance.getActiveObject() as fabric.Image | null;
    if (!selected || selected.type !== "image") return;
    this.onChangeImageProperty(selected, property, value);
  }

  onChangeVideoProperty(video: fabric.Video, property: keyof fabric.Video, value: any) {
    if (video.type !== "video") return;
    video.set(property, value);
    this.instance.fire("object:modified", { target: video });
    this.instance.requestRenderAll();
  }

  onChangeActiveVideoProperty(property: keyof fabric.Video, value: any) {
    const selected = this.instance.getActiveObject() as fabric.Video | null;
    if (!selected || selected.type !== "video") return;
    this.onChangeVideoProperty(selected, property, value);
  }

  destroy() {
    this.instance?.dispose();
  }
}
