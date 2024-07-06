import anime from "animejs";

import { fabric } from "fabric";
import { makeAutoObservable } from "mobx";

import { activityIndicator, elementsToExclude, propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createInstance, isVideoElement } from "@/lib/utils";
import { EntryAnimation, ExitAnimation } from "canvas";

export const artboardHeight = 1080;
export const artboardWidth = 1080;

export const canvasYPadding = 100;
export const artboardFill = "#FFFFFF";

export class Canvas {
  instance?: fabric.Canvas;
  artboard?: fabric.Rect;

  elements: fabric.Object[];
  selected?: fabric.Object | null;
  crop?: fabric.Image | null;

  seek: number;
  duration: number;

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

    this.seek = 0;
    this.duration = 30000;
    this.playing = false;

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
    this.elements[index] = element;
  }

  private onRemoveElement(object?: fabric.Object) {
    if (!object) return;
    const index = this.elements.findIndex((element) => element.name === object.name);
    if (index !== -1) this.elements.splice(index, 1);
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

  private onDeleteGuidelines() {
    const centerH = this.instance?.getItemByName("center_h");
    const centerV = this.instance?.getItemByName("center_v");

    const lineH = this.instance?.getItemByName("line_h");
    const lineV = this.instance?.getItemByName("line_v");

    if (centerH) this.instance?.remove(centerH);
    if (centerV) this.instance?.remove(centerV);

    if (lineH) this.instance?.remove(lineH);
    if (lineV) this.instance?.remove(lineV);
  }

  private onUpdateSelection() {
    this.selected = this.instance?.getActiveObject()?.toObject(propertiesToInclude);
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

  private onToggleCanvasElements(ms: number) {
    if (!this.instance) return;

    for (const object of this.instance._objects) {
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

    this.instance.requestRenderAll();
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
    });

    this.instance.on("object:resizing", (event) => {
      this.onToggleControls(event.target!, false);
    });

    this.instance.on("object:rotating", (event) => {
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
          if (event.target.clipPath) {
            // this.onModifyImageClipPath(event.target as fabric.Image);
          } else {
            this.onCropImageStart(event.target as fabric.Image);
          }
          break;
      }
    });
  }

  private onInitializeAnimationTimeline() {
    if (!this.instance || !this.artboard) return;

    this.timeline = anime.timeline({
      duration: this.duration,
      autoplay: false,
      begin: (anim) => {
        this.onChangeSeekTime(anim.currentTime / 1000);
      },
      update: (anim) => {
        this.onChangeSeekTime(anim.currentTime / 1000);
      },
      complete: () => {
        this.onUpdateTimelineStatus(false);
        this.onResetAnimationTimeline();
        this.onChangeSeekTime(0);
      },
    });

    this.timeline.add({
      targets: this.artboard,
      duration: this.duration,
    });

    for (const object of this.instance._objects) {
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
              opacity: [1, 0],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "slide-out-left": {
          console.log(1);
          this.timeline.add(
            {
              targets: object,
              opacity: [1, 0],
              left: [object.left!, object.left! - 150],
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

    this.instance.requestRenderAll();
  }

  private onResetAnimationTimeline() {
    if (!this.instance || !this.artboard) return;

    if (this.timeline) {
      anime.remove(this.timeline);
      this.timeline = null;
    }

    for (const object of this.instance._objects) {
      if (this.isElementExcluded(object)) continue;
      object.set({ ...(object.anim?.state || {}) });
    }

    this.onToggleCanvasElements(this.seek);
  }

  onInitialize(element: HTMLCanvasElement) {
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, backgroundColor: "#F0F0F0", preserveObjectStacking: true, controlsAboveOverlay: true });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", height: this.height, width: this.width, fill: this.fill, rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default" });

    this.instance.selectionColor = "rgba(46, 115, 252, 0.11)";
    this.instance.selectionBorderColor = "rgba(98, 155, 255, 0.81)";
    this.instance.selectionLineWidth = 1.5;

    this.instance.add(this.artboard);
    this.instance.clipPath = this.artboard;

    this.zoom = 0.5;
    this.instance.setZoom(this.zoom);

    this.onInitializeEvents();
    this.instance.requestRenderAll();
  }

  onStartTimeline(last?: boolean) {
    if (!this.instance || this.playing) return;

    this.instance.discardActiveObject();
    this.onInitializeAnimationTimeline();

    this.playing = true;
    if (last) this.timeline!.seek(this.seek);
    this.timeline!.play();
  }

  onPauseTimeline(initial?: boolean) {
    if (!this.instance || !this.playing) return;

    this.playing = false;
    this.timeline!.pause();

    if (initial) this.seek = 0;
    this.onResetAnimationTimeline();
  }

  onDeleteObjectByName(name?: string) {
    if (!this.instance) return;
    const object = this.instance.getItemByName(name);
    if (object) this.instance.remove(object);
  }

  onUpdateResponsiveCanvas({ height, width }: { height: number; width: number }) {
    if (!this.instance || !this.artboard) return;

    this.onDeleteGuidelines();
    this.instance.setDimensions({ width, height });
    this.onCenterArtboard();
    this.onInitializeGuidelines();

    this.instance.requestRenderAll();
  }

  onUpdateDimensions({ height, width }: { height?: number; width?: number }) {
    if (!this.artboard || !this.instance) return;

    if (height) {
      this.height = height;
      this.artboard?.set("height", height);
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

    const options = { name: FabricUtils.elementID("text"), fontFamily, fontWeight, fontSize, width: 500, paintFirst: "stroke", objectCaching: false, textAlign: "center" };
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

  *onAddImageFromSource(source: string): Generator<Promise<fabric.Image>, fabric.Image | undefined, fabric.Image> {
    if (!this.instance || !this.artboard) return;
    return yield createInstance(Promise<fabric.Image>, (resolve, reject) => {
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

  *onAddImageWithThumbail(source: string, _thumbnail: HTMLImageElement): Generator<Promise<fabric.Image>, fabric.Image | undefined, fabric.Image> {
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

    return yield createInstance(Promise<fabric.Image>, (resolve, reject) => {
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

  *onAddVideoFromSource(source: string): Generator<Promise<fabric.Video>, fabric.Video | undefined, fabric.Video> {
    if (!this.instance || !this.artboard) return;
    return yield createInstance(Promise<fabric.Video>, (resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!video) return reject();

          video.scaleToHeight(500);
          video.setPositionByOrigin(this.artboard!.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(video);
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

  *onAddVideoWithThumbail(source: string, _thumbnail: HTMLImageElement): Generator<Promise<fabric.Video>, fabric.Video | undefined, fabric.Video> {
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

    return yield createInstance(Promise<fabric.Video>, (resolve, reject) => {
      fabric.Video.fromURL(
        source,
        (video) => {
          if (!video) {
            this.instance!.remove(thumbnail, overlay, spinner).requestRenderAll();
            return reject();
          }

          const scaleX = thumbnail.getScaledWidth() / video.getScaledWidth();
          const scaleY = thumbnail.getScaledHeight() / video.getScaledHeight();

          video.set({ scaleX, scaleY }).setPositionByOrigin(thumbnail.getCenterPoint(), "center", "center");

          this.onInitializeElementMeta(video);
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

  onCreateSelection(name?: string, multiple?: boolean) {
    const object = this.instance?.getItemByName(name);

    if (!this.instance || !object) return;

    const selected = this.instance.getActiveObject();

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

  onAddClipPathToImage(image: fabric.Image, clipPath: fabric.Object) {
    if (!this.instance || !this.artboard) return;

    const index = this.instance._objects.findIndex((object) => object === image);
    if (index === -1) return;

    const height = image.getScaledHeight();
    const width = image.getScaledWidth();

    this.onRemoveElement(clipPath);
    clipPath.moveTo(index - 1);

    if (height > width) clipPath.scaleToWidth(width / 2.05);
    else clipPath.scaleToHeight(height / 2.05);

    clipPath.set({ absolutePositioned: true, name: "clip_" + image.name, selectable: false, evented: false }).setPositionByOrigin(image.getCenterPoint(), "center", "center");
    image.set({ clipPath: clipPath });

    if (!clipPath.meta) clipPath.meta = {};

    clipPath.meta.offsetX = clipPath.left! - image.left!;
    clipPath.meta.offsetY = clipPath.top! - image.top!;
    clipPath.meta.angleOffset = clipPath.angle! - image.angle!;

    clipPath.meta.widthOffset = clipPath.getScaledWidth() - image.getScaledWidth();
    clipPath.meta.heightOffset = clipPath.getScaledHeight() - image.getScaledHeight();

    image.on("moving", () => {
      clipPath.set({ left: image.left! + clipPath.meta!.offsetX, top: image.top! + clipPath.meta!.offsetY });
      clipPath.setCoords();
    });

    image.on("scaling", () => {
      const scaleY = (image.getScaledHeight() + clipPath.meta!.heightOffset) / clipPath.height!;
      const scaleX = (image.getScaledWidth() + clipPath.meta!.widthOffset) / clipPath.width!;
      clipPath.set({ scaleX, scaleY });
      clipPath.setCoords();
    });

    image.on("rotating", () => {
      clipPath.rotate(image.angle! + clipPath.meta!.angleOffset);
      clipPath.setCoords();
    });

    this.instance.requestRenderAll();
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

  onChangeTextboxProperty(textbox: fabric.Textbox, property: keyof fabric.Textbox, value: any) {
    if (!this.instance || textbox.type !== "textbox") return;
    textbox.set(property, value);
    this.instance.fire("object:modified", { target: textbox });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxProperty(property: keyof fabric.Textbox, value: any) {
    const selected = this.instance?.getActiveObject() as fabric.Textbox | null;
    if (!selected || selected.type !== "textbox") return;
    this.onChangeTextboxProperty(selected, property, value);
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

  onChangeDuration(duration: number) {
    this.duration = duration * 1000;
    if (this.timeline) this.timeline.duration = this.duration;
  }
}
