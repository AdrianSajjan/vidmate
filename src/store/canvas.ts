import { nanoid } from "nanoid";
import { fabric } from "fabric";
import { floor, isUndefined } from "lodash";
import { makeAutoObservable, runInAction } from "mobx";

import { CanvasAlignment } from "@/plugins/alignment";
import { CanvasAudio } from "@/plugins/audio";
import { CanvasCropper } from "@/plugins/crop";
import { CanvasEffects } from "@/plugins/filters";
import { CanvasGuidelines } from "@/plugins/guidelines";
import { CanvasHistory } from "@/plugins/history";
import { CanvasClipMask } from "@/plugins/mask";
import { CanvasReplace } from "@/plugins/replace";
import { CanvasSelection } from "@/plugins/selection";
import { CanvasTemplate } from "@/plugins/template";
import { CanvasTimeline } from "@/plugins/timeline";
import { CanvasTrimmer } from "@/plugins/trim";
import { CanvasWorkspace } from "@/plugins/workspace";
import { CanvasChart } from "@/plugins/chart";
import { CanvasText } from "@/plugins/text";
import { CanvasAnimations } from "@/plugins/animations";

import { EditorFont } from "@/constants/fonts";
import { activityIndicator, propertiesToInclude, textLayoutProperties } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise } from "@/lib/utils";
export class Canvas {
  id: string;
  name: string;

  artboard!: fabric.Rect;
  instance!: fabric.Canvas;

  text!: CanvasText;
  audio!: CanvasAudio;
  chart!: CanvasChart;
  timeline!: CanvasTimeline;
  animations!: CanvasAnimations;
  workspace!: CanvasWorkspace;

  replacer!: CanvasReplace;
  effects!: CanvasEffects;
  cropper!: CanvasCropper;
  clipper!: CanvasClipMask;
  trimmer!: CanvasTrimmer;

  history!: CanvasHistory;
  template!: CanvasTemplate;
  selection!: CanvasSelection;
  alignment!: CanvasAlignment;

  controls: boolean;
  elements: fabric.Object[];

  constructor() {
    this.id = nanoid();
    this.name = "Untitled Page";
    this.elements = [];
    this.controls = true;
    this.template = createInstance(CanvasTemplate, this);

    makeAutoObservable(this);
  }

  private _toggleControls(object: fabric.Object, enabled: boolean) {
    runInAction(() => {
      object.hasControls = enabled;
      this.controls = enabled;
    });
  }

  private _refreshElements() {
    runInAction(() => {
      this.elements = this.instance._objects.filter((object) => !object.excludeFromTimeline).map((object) => object.toObject(propertiesToInclude));
    });
  }

  private _objectAddedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target || event.target.excludeFromTimeline) return;
      this.elements.push(event.target.toObject(propertiesToInclude));
    });
  }

  private _objectModifiedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target) return;
      this._toggleControls(event.target, true);
      FabricUtils.applyObjectScaleToDimensions(event.target, ["rect"]);
      const index = this.elements.findIndex((element) => element.name === event.target!.name);
      if (index === -1 || event.target.excludeFromTimeline) return;
      this.elements[index] = event.target.toObject(propertiesToInclude);
    });
  }

  private _objectDeletedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target) return;
      const index = this.elements.findIndex((element) => element.name === event.target!.name);
      if (index !== -1) this.elements.splice(index, 1);
      if (event.target.clipPath) this.instance.remove(event.target.clipPath);
    });
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
      this._toggleControls(event.target, false);
    });
  }

  private _objectRotatingEvent(event: fabric.IEvent<MouseEvent>) {
    runInAction(() => {
      if (!event.target) return;
      this._toggleControls(event.target, false);
      if (event.e.shiftKey) event.target.set({ snapAngle: 45 });
      else event.target.set({ snapAngle: undefined });
    });
  }

  private _initEvents() {
    this.instance.on("object:added", this._objectAddedEvent.bind(this));
    this.instance.on("object:modified", this._objectModifiedEvent.bind(this));
    this.instance.on("object:removed", this._objectDeletedEvent.bind(this));

    this.instance.on("object:moving", this._objectMovingEvent.bind(this));
    this.instance.on("object:scaling", this._objectScalingEvent.bind(this));
    this.instance.on("object:rotating", this._objectRotatingEvent.bind(this));

    this.instance.on("clip:added", this._refreshElements.bind(this));
    this.instance.on("clip:removed", this._refreshElements.bind(this));
    this.instance.on("object:layer", this._refreshElements.bind(this));
  }

  *initialize(element: HTMLCanvasElement, workspace: HTMLDivElement) {
    const props = { width: workspace.offsetWidth, height: workspace.offsetHeight, backgroundColor: "#F0F0F0" };
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, preserveObjectStacking: true, renderOnAddRemove: false, controlsAboveOverlay: true, ...props });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default", excludeFromExport: true, excludeFromTimeline: true });

    this.history = createInstance(CanvasHistory, this);
    this.alignment = createInstance(CanvasAlignment, this);
    this.selection = createInstance(CanvasSelection, this);
    this.replacer = createInstance(CanvasReplace, this);

    this.effects = createInstance(CanvasEffects, this);
    this.clipper = createInstance(CanvasClipMask, this);
    this.cropper = createInstance(CanvasCropper, this);
    this.trimmer = createInstance(CanvasTrimmer, this);

    this.text = createInstance(CanvasText, this);
    this.chart = createInstance(CanvasChart, this);
    this.audio = createInstance(CanvasAudio, this);
    this.timeline = createInstance(CanvasTimeline, this);
    this.animations = createInstance(CanvasAnimations, this);
    this.workspace = createInstance(CanvasWorkspace, this, workspace);

    this._initEvents();
    CanvasGuidelines.initializeAligningGuidelines(this.instance);

    this.instance.clipPath = this.artboard;
    this.instance.add(this.artboard).renderAll();
    if (this.template.pending) yield this.template.load();
  }

  onToggleControls(visible?: boolean) {
    if (isUndefined(visible)) this.controls = !this.controls;
    else this.controls = visible;
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

  *onCloneObject(object?: fabric.Object) {
    if (!object) return;

    const name = FabricUtils.elementID(object.name!.split("_").at(0) || "clone");
    const meta = structuredClone(object.meta);
    const anim = structuredClone(object.anim);

    const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clone(resolve, propertiesToInclude));
    clone.set({ name: name, top: clone.top!, left: clone.left!, meta: meta, anim: anim, clipPath: undefined }).setCoords();

    if (object.clipPath) {
      this.history.active = false;

      const clipPath: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clipPath!.clone(resolve, propertiesToInclude));
      clipPath.set({ name: FabricUtils.elementID(clipPath.name!.split("_").at(0) || "clone") });

      FabricUtils.bindObjectTransformToParent(clone, [clipPath]);
      const handler = () => FabricUtils.updateObjectTransformToParent(clone, [{ object: clipPath }]);

      clone.on("moving", handler);
      clone.on("scaling", handler);
      clone.on("rotating", handler);
      clone.set({ clipPath }).setCoords();

      this.instance.add(clipPath, clone);
      this.instance.setActiveObject(clone).requestRenderAll();
      this.history.active = true;

      this.instance.fire("object:modified", { target: clone });
      this.instance.fire("clip:added", { target: clone });
    } else {
      this.instance.add(clone);
      this.instance.setActiveObject(clone).requestRenderAll();
    }

    return clone;
  }

  *onCloneActiveObject() {
    const object = this.instance.getActiveObject();
    const clone: fabric.Object = yield this.onCloneObject(object!);
    return clone;
  }

  onAddText(text: string, font: EditorFont, fontSize: number, fontWeight: number) {
    const dimensions = FabricUtils.measureTextDimensions(text, font.family, fontSize, fontWeight);
    const options = { name: FabricUtils.elementID("text"), objectCaching: false, fontFamily: font.family, fontWeight, fontSize, width: Math.min(dimensions.width, this.workspace.width), textAlign: "center" };
    const textbox = createInstance(fabric.Textbox, text, options);

    textbox.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");
    FabricUtils.initializeMetaProperties(textbox, { font });
    FabricUtils.initializeAnimationProperties(textbox);

    this.instance.add(textbox);
    this.instance.setActiveObject(textbox).requestRenderAll();
    return textbox;
  }

  *onAddImageFromSource(source: string, options?: fabric.IImageOptions, skip = false, render = true) {
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

          this.instance.add(image);
          if (!skip) this.instance.setActiveObject(image);
          if (render) this.instance.requestRenderAll();

          resolve(image);
        },
        { ...options, name: FabricUtils.elementID("image"), crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddImageFromThumbail(source: string, thumbnail: HTMLImageElement) {
    const overlay = createInstance(fabric.Rect, { fill: "#000000", opacity: 0.25, evented: false, selectable: false, excludeFromAlignment: true });
    const image = createInstance(fabric.Image, thumbnail, { type: "video", crossOrigin: "anonymous", evented: false, selectable: false, excludeFromAlignment: true });
    const spinner = createInstance(fabric.Path, activityIndicator, { fill: "", stroke: "#fafafa", strokeWidth: 4, evented: false, selectable: false, excludeFromAlignment: true });

    image.scaleToWidth(500);
    spinner.scaleToWidth(48);
    overlay.set({ height: image.height, width: image.width, scaleX: image.scaleX, scaleY: image.scaleY });

    const id = FabricUtils.elementID("image");
    const placeholder = createInstance(fabric.Group, [image, overlay, spinner], { name: id, excludeFromExport: true });

    spinner.setPositionByOrigin(overlay.getCenterPoint(), "center", "center");
    placeholder.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    FabricUtils.objectSpinningAnimation(spinner);
    FabricUtils.initializeMetaProperties(placeholder, { thumbnail: true });
    FabricUtils.initializeAnimationProperties(placeholder);

    this.instance.add(placeholder);
    this.instance.setActiveObject(placeholder).requestRenderAll();

    return createPromise<fabric.Image | null>((resolve, reject) => {
      fabric.Image.fromURL(
        source,
        (image) => {
          if (!this.instance!.contains(placeholder)) {
            return resolve(null);
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
        { name: id, crossOrigin: "anonymous", objectCaching: false, effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromSource(source: string, options?: fabric.IVideoOptions, skip = false, render = true) {
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
          FabricUtils.initializeMetaProperties(video, { duration: Math.min(floor(element.duration, 1) * 1000, this.timeline.duration), ...options?.meta });
          FabricUtils.initializeAnimationProperties(video, { ...options?.anim });

          this.instance.add(video);
          if (!skip) this.instance.setActiveObject(video);
          if (render) this.instance.requestRenderAll();

          resolve(video);
        },
        { ...options, name: FabricUtils.elementID("video"), objectCaching: false, crossOrigin: "anonymous", effects: {}, adjustments: {} },
      );
    });
  }

  *onAddVideoFromThumbail(source: string, thumbnail: HTMLImageElement) {
    const overlay = createInstance(fabric.Rect, { fill: "#000000", opacity: 0.25, evented: false, selectable: false, excludeFromAlignment: true });
    const image = createInstance(fabric.Image, thumbnail, { type: "video", crossOrigin: "anonymous", evented: false, selectable: false, excludeFromAlignment: true });
    const spinner = createInstance(fabric.Path, activityIndicator, { fill: "", stroke: "#fafafa", strokeWidth: 4, evented: false, selectable: false, excludeFromAlignment: true });

    image.scaleToWidth(500);
    spinner.scaleToWidth(48);

    overlay.set({ height: image.height, width: image.width, scaleX: image.scaleX, scaleY: image.scaleY });
    FabricUtils.objectSpinningAnimation(spinner);

    const id = FabricUtils.elementID("video");
    const placeholder = createInstance(fabric.Group, [image, overlay, spinner], { name: id, excludeFromExport: true });

    placeholder.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    FabricUtils.initializeMetaProperties(placeholder, { thumbnail: true });
    FabricUtils.initializeAnimationProperties(placeholder);

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
    const shape: fabric.Object = createInstance((fabric as any)[klass], { name: FabricUtils.elementID(klass), ...params, objectCaching: false });
    shape.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    FabricUtils.initializeMetaProperties(shape);
    FabricUtils.initializeAnimationProperties(shape);

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();

    return shape;
  }

  onAddAbstractShape(path: string, name = "shape") {
    const options = { name: FabricUtils.elementID(name), fill: "#000000", objectCaching: false };
    const shape = createInstance(fabric.Path, path, { ...options });

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
    const options = { name: FabricUtils.elementID(name), strokeWidth: 4, stroke: "#000000", hasBorders: false, objectCaching: false };
    const line = createInstance(fabric.Line, points, options);

    line.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
    line.set({ controls: { mtr: fabric.Object.prototype.controls.mtr, mr: fabric.Object.prototype.controls.mr, ml: fabric.Object.prototype.controls.ml } });

    FabricUtils.initializeMetaProperties(line);
    FabricUtils.initializeAnimationProperties(line);

    this.instance.add(line);
    this.instance.setActiveObject(line).requestRenderAll();

    return line;
  }

  onMarkObjectAsPlaceholder(object: fabric.Object, label: string | false) {
    if (!object || !object.meta) return;
    object.meta.placeholder = !!label;
    object.meta.label = label || undefined;
  }

  onMarkActiveObjectAsPlaceholder(label: string | false) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onMarkObjectAsPlaceholder(selected, label);
  }

  onChangeObjectTimelineProperty(object: fabric.Object, property: string, value: number) {
    if (!object || !object.meta) return;
    object.meta[property] = value;
    this.timeline.update(object);
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

  onChangeObjectFillGradient(object: fabric.Object, type: string, colors: fabric.IGradientOptionsColorStops, coords: fabric.IGradientOptionsCoords) {
    if (!object) return;
    const gradient = createInstance(fabric.Gradient, { type: type, gradientUnits: "percentage", colorStops: colors, coords: coords });
    object.set({ fill: gradient });
    this.instance.fire("object:modified", { target: object });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectFillGradient(type: string, colors: fabric.IGradientOptionsColorStops, coords: fabric.IGradientOptionsCoords) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectFillGradient(selected, type, colors, coords);
  }

  onChangeObjectAnimation(object: fabric.Object, type: "in" | "out" | "scene", animation: fabric.EntryAnimation | fabric.ExitAnimation | fabric.SceneAnimations) {
    if (!object) return;
    object.anim![type].name = animation;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangeActiveObjectAnimation(type: "in" | "out" | "scene", animation: fabric.EntryAnimation | fabric.ExitAnimation | fabric.SceneAnimations) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimation(selected, type, animation);
  }

  onChangeObjectAnimationDuration(object: fabric.Object, type: "in" | "out" | "scene", duration: number) {
    if (!object) return;
    object.anim![type].duration = duration;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangeObjectAnimationEasing(object: fabric.Object, type: "in" | "out" | "scene", easing: any) {
    if (!object) return;
    object.anim![type].easing = easing;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangeActiveObjectAnimationEasing(type: "in" | "out" | "scene", easing: any) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimationEasing(selected, type, easing);
  }

  onChangeActiveObjectAnimationDuration(type: "in" | "out" | "scene", duration: number) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeObjectAnimationDuration(selected, type, duration);
  }

  onChangeTextAnimationType(object: fabric.Object, type: "in" | "out" | "scene", animate: fabric.TextAnimateOptions) {
    if (!object) return;
    object.anim![type].text = animate;
    this.instance.fire("object:modified", { target: object }).requestRenderAll();
  }

  onChangeActiveTextAnimationType(type: "in" | "out" | "scene", animate: fabric.TextAnimateOptions) {
    const selected = this.instance.getActiveObject();
    if (selected) this.onChangeTextAnimationType(selected, type, animate);
  }

  onChangeTextboxProperty(textbox: fabric.Textbox, property: keyof fabric.Textbox, value: any, _selection = false) {
    if (textbox.type !== "textbox") return;
    textbox.set(property, value);
    if (textLayoutProperties.includes(property)) textbox.initDimensions();
    this.instance.fire("object:modified", { target: textbox });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxProperty(property: keyof fabric.Textbox, value: any, selection = false) {
    const selected = this.instance.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    this.onChangeTextboxProperty(selected, property, value, selection);
  }

  onChangeTextboxFontFamily(textbox: fabric.Textbox, font: string, family: EditorFont) {
    if (textbox.type !== "textbox") return;
    textbox.set("fontFamily", font);
    textbox.meta!.font = family;
    this.instance.fire("object:modified", { target: textbox });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxFontFamily(font: string, family: EditorFont) {
    const selected = this.instance.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    this.onChangeTextboxFontFamily(selected, font, family);
  }

  onEnterActiveTextboxEdit() {
    const selected = this.instance.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    selected.enterEditing();
    this.instance.fire("object:modified", { target: selected });
    this.instance.requestRenderAll();
  }

  onExitActiveTextboxEdit() {
    const selected = this.instance.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    selected.exitEditing();
    this.instance.fire("object:modified", { target: selected });
    this.instance.requestRenderAll();
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
    this.workspace?.destroy();
  }
}
