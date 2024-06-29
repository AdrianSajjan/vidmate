import { fabric } from "fabric";
import anime from "animejs";
import { makeAutoObservable } from "mobx";

import { activityIndicator, elementsToExclude, propertiesToInclude } from "@/fabric/constants";
import { isActiveSelection, elementID, FabricUtils } from "@/fabric/utils";
import { createInstance } from "@/lib/utils";

export const artboardHeight = 1080;
export const artboardWidth = 1080;

export const canvasYPadding = 100;
export const artboardFill = "#FFFFFF";

export class Canvas {
  instance?: fabric.Canvas;
  artboard?: fabric.Rect;

  elements: fabric.Object[];
  selected?: fabric.Object | null;
  crop?: fabric.Object | null;

  verticalGuideline?: fabric.Line;
  horizontalGuideline?: fabric.Line;

  seek: number;
  duration: number;
  playing: boolean;
  timeline: anime.AnimeTimelineInstance;

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

    this.timeline = anime.timeline({
      duration: this.duration,
      autoplay: false,
      complete: () => {
        this.onUpdateTimelineStatus(false);
      },
      update: (anim) => {
        this.onUpdateSeekTime(anim.currentTime);
      },
    });

    makeAutoObservable(this);
  }

  private isElementExcluded(object: fabric.Object) {
    return elementsToExclude.includes(object.name!) || object.name!.startsWith("crop") || object.name!.startsWith("clone") || object.name!.startsWith("clip") || object.name!.startsWith("overlay");
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

  private onUpdateTimelineStatus(playing: boolean) {
    this.playing = playing;
  }

  private onUpdateSeekTime(time: number) {
    this.seek = time;
    this.onToggleCanvasElements(this.seek);
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
      })
    );
    this.instance.add(
      createInstance(fabric.Line, [0, vCenter, this.instance.width!, vCenter], {
        opacity: 0,
        selectable: false,
        evented: false,
        name: "center_v",
      })
    );

    this.horizontalGuideline = createInstance(fabric.Line, [hCenter, this.artboard.top!, hCenter, this.artboard.height! + this.artboard.top!], {
      stroke: "red",
      opacity: 0,
      selectable: false,
      evented: false,
      name: "line_h",
    });
    this.verticalGuideline = createInstance(fabric.Line, [this.artboard.left!, vCenter, this.artboard.width! + this.artboard.left!, vCenter], {
      stroke: "red",
      opacity: 0,
      selectable: false,
      evented: false,
      name: "line_v",
    });

    this.instance.add(this.verticalGuideline);
    this.instance.add(this.horizontalGuideline);

    this.instance.requestRenderAll();
  }

  private onSnapToGuidelines(event: fabric.IEvent<MouseEvent>) {
    if (!this.horizontalGuideline || !this.verticalGuideline || !this.instance) return;

    this.horizontalGuideline.opacity = 0;
    this.verticalGuideline.opacity = 0;
    this.instance.requestRenderAll();

    const snapZone = 5;
    const targetLeft = event.target!.left!;
    const targetTop = event.target!.top!;
    const targetWidth = event.target!.width! * event.target!.scaleX!;
    const targetHeight = event.target!.height! * event.target!.scaleY!;

    this.instance.forEachObject((obj) => {
      if (obj != event.target && obj != this.horizontalGuideline && obj != this.verticalGuideline) {
        if (obj.get("name") == "center_h" || obj.get("name") == "center_v") {
          const check1 = [[targetLeft, obj.left!, 1]];
          const check2 = [[targetTop, obj.top!, 1]];

          for (let i = 0; i < check1.length; i++) {
            this.checkHorizontalSnap(check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            this.checkVerticalSnap(check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
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
            this.checkHorizontalSnap(check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            this.checkVerticalSnap(check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
          }
        }
      }
    });
  }

  private checkHorizontalSnap(a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (!this.horizontalGuideline || !this.artboard || !this.instance) return;

    if (a > b - snapZone && a < b + snapZone) {
      this.horizontalGuideline.opacity = 1;
      this.horizontalGuideline.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.width! * event.target!.scaleX!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.width! * event.target!.scaleX!) / 2;
      }

      event.target!.set({ left: value }).setCoords();
      this.horizontalGuideline.set({ x1: b, y1: this.artboard.top!, x2: b, y2: this.artboard.height! + this.artboard.top! }).setCoords();
      this.instance.requestRenderAll();
    }
  }

  private checkVerticalSnap(a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (!this.verticalGuideline || !this.artboard || !this.instance) return;

    if (a > b - snapZone && a < b + snapZone) {
      this.verticalGuideline.opacity = 1;
      this.verticalGuideline.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.height! * event.target!.scaleY!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.height! * event.target!.scaleY!) / 2;
      }

      event.target!.set({ top: value }).setCoords();
      this.verticalGuideline.set({ y1: b, x1: this.artboard.left!, y2: b, x2: this.artboard.width! + this.artboard.left! }).setCoords();
      this.instance.requestRenderAll();
    }
  }

  private onResetGuidelines() {
    if (!this.horizontalGuideline || !this.verticalGuideline) return;
    this.horizontalGuideline.opacity = 0;
    this.verticalGuideline.opacity = 0;
  }

  private onDeleteGuidelines() {
    if (!this.instance) return;

    const centerH = this.instance.getItemByName("center_h");
    const centerV = this.instance.getItemByName("center_v");

    const lineH = this.instance.getItemByName("line_h");
    const lineV = this.instance.getItemByName("line_v");

    if (centerH) this.instance.remove(centerH);
    if (centerV) this.instance.remove(centerV);

    if (lineH) this.instance.remove(lineH);
    if (lineV) this.instance.remove(lineV);
  }

  private onCropImageStart(image: fabric.Image) {
    if (!this.instance || !this.artboard) return;

    const crop = createInstance(fabric.Cropper, {
      name: "crop_" + image.name,
      top: image.top,
      left: image.left,
      angle: image.angle,
      width: image.getScaledWidth(),
      height: image.getScaledHeight(),
      fill: "rgba(255, 255, 255, 1)",
      globalCompositeOperation: "overlay",
      lockRotation: true,
    });

    const overlay = createInstance(fabric.Rect, {
      name: "overlay_" + image.name,
      top: image.top,
      left: image.left,
      angle: image.angle,
      width: image.getScaledWidth(),
      height: image.getScaledHeight(),
      selectable: false,
      fill: "rgba(0, 0, 0, 0.5)",
      lockRotation: true,
    });

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

    const element = image.getElement() as HTMLImageElement;

    const width = image.width!;
    const height = image.height!;
    const cropX = image.cropX!;
    const cropY = image.cropY!;

    image.set({ cropX: 0, cropY: 0, dirty: false, selectable: false, left: image.left! - cropX * image.scaleX!, top: image.top! - cropY * image.scaleY!, width: element.naturalWidth, height: element.naturalHeight });
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

      verticals.map((vertical, index) => vertical.set({ x1: crop.left! + crop.width! * 0.25 * (index + 1), y1: crop.top!, x2: crop.left! + crop.width! * 0.25 * (index + 1), y2: crop.top! + crop.height! }));
      horizontals.map((vertical, index) => vertical.set({ x1: crop.left!, y1: crop.top! + crop.height! * 0.25 * (index + 1), x2: crop.left! + crop.width!, y2: crop.top! + crop.height! * 0.25 * (index + 1) }));

      this.instance!.requestRenderAll();
    });

    crop.on("scaling", () => {
      verticals.map((vertical, index) => vertical.set({ x1: crop.left! + crop.width! * 0.25 * (index + 1), y1: crop.top!, x2: crop.left! + crop.width! * 0.25 * (index + 1), y2: crop.top! + crop.height! }));
      horizontals.map((vertical, index) => vertical.set({ x1: crop.left!, y1: crop.top! + crop.height! * 0.25 * (index + 1), x2: crop.left! + crop.width!, y2: crop.top! + crop.height! * 0.25 * (index + 1) }));
    });

    crop.on("mouseup", () => {});

    crop.on("deselected", () => {
      this.onCropImageEnd(crop, image);
      this.instance!.remove(overlay);
      this.instance!.remove(...verticals, ...horizontals);
      this.instance!.requestRenderAll();
    });
  }

  private onCropImageEnd(crop: fabric.Rect, image: fabric.Image) {
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

  private *onEditImageClippingMaskStart(image: fabric.Image) {
    if (!this.instance || !this.artboard) return;

    const index = this.instance._objects.findIndex((object) => object === image);
    this.crop = image;

    const clipPath = image.clipPath!;
    const element = image.getElement() as HTMLImageElement;

    const left = image.left!;
    const top = image.top!;
    const x = image.cropX! * image.scaleX!;
    const y = image.cropY! * image.scaleY!;

    image.set({ left: left - x, top: top - y, width: element.naturalWidth, height: element.naturalHeight, clipPath: undefined, cropX: 0, cropY: 0, opacity: 0.5, dirty: false, lockRotation: true });

    const clone: fabric.Image = yield createInstance(Promise, (resolve) =>
      image.clone((clone: fabric.Image) => {
        clone.set({ name: "clone_" + image.name, selectable: false, scaleX: image.scaleX, scaleY: image.scaleY, clipPath: clipPath, opacity: 1 });
        resolve(clone);
      })
    );

    this.instance.insertAt(clone, index + 1, false);
    this.instance.requestRenderAll();

    image.on("moving", () => {
      if (image.left! >= clipPath.left!) image.left = clipPath.left!;
      if (image.top! >= clipPath.top!) image.top = clipPath.top!;

      if (image.left! + image.getScaledWidth() <= clipPath.left! + clipPath.getScaledWidth()) image.left = clipPath.left! - (image.getScaledWidth() - clipPath.getScaledWidth());
      if (image.top! + image.getScaledHeight() <= clipPath.top! + clipPath.getScaledHeight()) image.top = clipPath.top! - (image.getScaledHeight() - clipPath.getScaledHeight());

      clone.left = image.left;
      clone.top = image.top;

      this.instance!.requestRenderAll();
    });

    image.on("scaling", () => {
      clone.scaleX = image.scaleX;
      clone.scaleY = image.scaleY;

      clone.left = image.left;
      clone.top = image.top;

      this.instance!.requestRenderAll();
    });

    image.on("deselected", () => {
      this.onEditImageClippingMaskEnd(image, clipPath);
      this.crop = null;
      this.instance!.remove(clone);
      this.instance!.requestRenderAll();
    });
  }

  private onEditImageClippingMaskEnd(image: fabric.Image, clipPath: fabric.Object) {
    if (!this.instance || !this.artboard) return;

    const cropX = (clipPath.left! - image.left!) / image.scaleX!;
    const cropY = (clipPath.top! - image.top!) / image.scaleY!;
    const width = (clipPath.width! * clipPath.scaleX!) / image.scaleX!;
    const height = (clipPath.height! * clipPath.scaleY!) / image.scaleY!;

    image.set({ cropX: cropX, cropY: cropY, width: width, height: height, top: clipPath.top!, left: clipPath.left!, clipPath: clipPath, selectable: true, lockRotation: false, opacity: 1 });
    image.setCoords();

    image.off("scaling");
    image.off("deselected");
    image.off("moving");

    this.instance.requestRenderAll();
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
    }

    this.instance.requestRenderAll();
  }

  private onInitializeElementMeta(object?: fabric.Object) {
    if (!object) return;

    object.meta = {
      duration: 5000,
      offset: 0,
    };

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

        if (zoom > 20) zoom = 20;
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
        case "image":
          if (this.crop === event.target) return;
          if (event.target.clipPath) {
            this.onEditImageClippingMaskStart(event.target as fabric.Image);
          } else {
            this.onCropImageStart(event.target as fabric.Image);
          }
          break;
      }
    });
  }

  private onInitializeAnimationTimeline() {
    if (!this.instance || !this.artboard) return;

    anime.remove(this.timeline);

    this.timeline = anime.timeline({
      duration: this.duration,
      autoplay: false,
      complete: () => {
        this.onUpdateTimelineStatus(false);
      },
      update: (anim) => {
        this.onUpdateSeekTime(anim.currentTime);
      },
    });

    this.timeline.add({
      targets: this.artboard,
      duration: this.duration,
    });

    for (const object of this.instance._objects) {
      if (this.isElementExcluded(object)) continue;

      const entry = object.anim!.in;
      const exit = object.anim!.out;

      switch (entry.name) {
        case "fade-in": {
          this.timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              duration: entry.duration,
              easing: "linear",
              round: false,
            },
            object.meta!.offset
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
              easing: "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration
          );
          break;
        }
      }
    }

    this.timeline.seek(this.seek);
  }

  onInitialize(element: HTMLCanvasElement) {
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, backgroundColor: "#F0F0F0", preserveObjectStacking: true, controlsAboveOverlay: true });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", height: this.height, width: this.width, fill: this.fill, rx: 0, ry: 0, selectable: false, absolutePositioned: true, hoverCursor: "default" });
    this.timeline.add({ targets: this.artboard, duration: this.duration });

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

  onToggleTimeline() {
    if (this.playing) {
      this.playing = false;
      this.timeline.pause();
    } else {
      this.playing = true;
      this.timeline.play();
    }
  }

  onDeleteObjectByName(name?: string) {
    if (!this.instance) return;

    const object = this.instance.getItemByName(name);
    const index = this.elements.findIndex((element) => element.name === name);

    if (object) this.instance.remove(object);
    if (index !== -1) this.elements.splice(index, 1);
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

  onUpdateZoom(zoom: number) {
    this.zoom = zoom;
  }

  onAddText(text: string, fontFamily: string, fontSize: number, fontWeight: number) {
    if (!this.artboard || !this.instance) return;

    const left = this.artboard.left! + this.artboard.width! / 2;
    const top = this.artboard.top! + this.artboard.height! / 2;

    const options = { name: elementID("text"), fontFamily, fontWeight, fontSize, paintFirst: "stroke", objectCaching: false, textAlign: "center" };
    const textbox = createInstance(fabric.Textbox, text, options);

    this.onInitializeElementMeta(textbox);
    textbox.set({ left: left - textbox.width! / 2, top: top - textbox.height! / 2 });

    this.instance.add(textbox);
    this.instance.setActiveObject(textbox);
    this.instance.requestRenderAll();

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);
  }

  onAddImageFromSource(source: string) {
    if (!this.instance || !this.artboard) return;

    const left = this.artboard.left! + this.artboard.width! / 2;
    const top = this.artboard.top! + this.artboard.height! / 2;

    const options = { name: elementID("image"), crossOrigin: "anonymous", objectCaching: true };
    fabric.Image.fromURL(
      source,
      (image) => {
        image.scaleToHeight(500);
        image.set({ left: left - image.getScaledWidth() / 2, top: top - image.getScaledHeight() / 2 });

        this.onInitializeElementMeta(image);
        this.instance!.add(image);

        this.instance!.setActiveObject(image);
        this.instance!.requestRenderAll();

        this.onInitializeAnimationTimeline();
        this.onToggleCanvasElements(this.seek);
      },
      options
    );
  }

  onAddImageWithThumbail(source: string, _thumbnail: HTMLImageElement) {
    if (!this.instance || !this.artboard) return;

    const left = this.artboard.left! + this.artboard.width! / 2;
    const top = this.artboard.top! + this.artboard.height! / 2;

    const options = { name: elementID("image"), crossOrigin: "anonymous", objectCaching: true };

    const thumbnail = createInstance(fabric.Image, _thumbnail, { ...options });
    const spinner = createInstance(fabric.Path, activityIndicator, { name: "overlay_" + options.name, fill: "", selectable: false, evented: false, stroke: "#000000", strokeWidth: 4, objectCaching: true });

    this.onInitializeElementMeta(thumbnail);
    thumbnail.scaleToWidth(500).set({ left: left - thumbnail.getScaledWidth() / 2, top: top - thumbnail.getScaledHeight() / 2 });

    this.instance.add(thumbnail).add(spinner);
    this.instance.setActiveObject(thumbnail);
    this.instance.requestRenderAll();

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);

    thumbnail.set({ opacity: 0.5 });
    this.instance.requestRenderAll();

    FabricUtils.bindObjectTransformToParent(thumbnail, spinner).updateObjectTransformToParent(thumbnail, spinner);
    thumbnail.on("moving", () => FabricUtils.updateObjectTransformToParent(thumbnail, spinner));
    thumbnail.on("scaling", () => FabricUtils.updateObjectTransformToParent(thumbnail, spinner));
    thumbnail.on("rotating", () => FabricUtils.updateObjectTransformToParent(thumbnail, spinner));
  }

  onAddBasicShape(klass: string, params: any) {
    if (!this.instance || !this.artboard) return;

    const left = this.artboard.left! + this.artboard.width! / 2;
    const top = this.artboard.top! + this.artboard.height! / 2;

    const options = { name: elementID(klass), objectCaching: true, ...params };
    const shape: fabric.Object = createInstance((fabric as any)[klass], options);

    this.onInitializeElementMeta(shape);
    shape.set({ left: left - shape.getScaledWidth() / 2, top: top - shape.getScaledHeight() / 2 });

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);
  }

  onAddAbstractShape(path: string, name = "shape") {
    if (!this.artboard || !this.instance) return;

    const left = this.artboard.left! + this.artboard.width! / 2;
    const top = this.artboard.top! + this.artboard.height! / 2;

    const options = { name: elementID(name), objectCaching: true, fill: "#000000" };
    const shape = createInstance(fabric.Path, path, options);
    this.onInitializeElementMeta(shape);

    shape.scaleToHeight(500);
    shape.set({ left: left - shape.getScaledWidth() / 2, top: top - shape.getScaledHeight() / 2 });

    this.instance.add(shape);
    this.instance.setActiveObject(shape);
    this.instance.requestRenderAll();

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);
  }

  onCreateSelection(name?: string, multiple?: boolean) {
    const object = this.instance?.getItemByName(name);

    if (!this.instance || !object) return;

    const selected = this.instance.getActiveObject();

    if (!selected || !multiple) {
      this.instance.setActiveObject(object);
    } else {
      if (isActiveSelection(selected)) {
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

  onChangeObjectTimelineOffset(name: string, offset: number) {
    const object = this.instance?.getItemByName(name);

    if (!object || !this.instance) return;

    this.instance.setActiveObject(object);
    object.meta!.offset = offset;

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);

    this.instance.fire("object:modified", { target: object });
  }

  onChangeActiveObjectTimelineProperty(property: string, value: any) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;

    if (!selected.meta) selected.meta = {};
    selected.meta[property] = value;

    this.onInitializeAnimationTimeline();
    this.onToggleCanvasElements(this.seek);

    this.instance.fire("object:modified", { target: selected });
    this.instance.requestRenderAll();
  }

  onChangeActiveObjectProperty(property: keyof fabric.Object, value: any) {
    const selected = this.instance?.getActiveObject();
    if (!this.instance || !selected) return;
    selected.set(property, value);
    this.instance.fire("object:modified", { target: selected });
    this.instance.requestRenderAll();
  }

  onChangeActiveTextboxProperty(property: keyof fabric.Textbox, value: any) {
    const selected = this.instance?.getActiveObject() as fabric.Textbox | null;
    if (!this.instance || !selected || selected.type !== "textbox") return;
    selected.set(property, value);
    this.instance.fire("object:modified", { target: selected });
    this.instance.requestRenderAll();
  }

  onChangeSeekTime(seek: number) {
    this.seek = seek * 1000;
    this.timeline.seek(this.seek);
    this.onToggleCanvasElements(this.seek);
  }

  onChangeDuration(duration: number) {
    this.duration = duration * 1000;
    this.timeline.duration = this.duration;
    this.onInitializeAnimationTimeline();
  }
}
