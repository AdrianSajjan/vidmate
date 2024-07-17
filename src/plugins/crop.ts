import { fabric } from "fabric";
import { makeAutoObservable, runInAction } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createInstance, isVideoElement } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

export class CanvasCropper {
  private _canvas: Canvas;
  active: fabric.Image | null;

  constructor(canvas: Canvas) {
    this.active = null;
    this._canvas = canvas;

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _initEvents() {
    this.canvas.on("mouse:dblclick", this._mouseDoubleClickEvent.bind(this));
    this.canvas.on("timeline:start", this._timelineRecorderStartEvent.bind(this));
    this.canvas.on("recorder:start", this._timelineRecorderStartEvent.bind(this));
  }

  private _timelineRecorderStartEvent() {
    this.active = null;
    this.canvas.discardActiveObject();
  }

  private _mouseDoubleClickEvent(event: fabric.IEvent<MouseEvent>) {
    if (!(FabricUtils.isImageElement(event.target) || FabricUtils.isVideoElement(event.target)) || this.active === event.target || event.target.meta!.placeholder) return;
    const image = event.target as fabric.Image;
    if (image.clipPath) {
      this.cropObjectWithClipPath(image);
    } else {
      this.cropObjectWithoutClipPath(image);
    }
  }

  cropObjectWithoutClipPath(image: fabric.Image) {
    this.active = image;
    this.canvas.fire("crop:start", { target: image });
    const element = image._originalElement as HTMLImageElement | HTMLVideoElement;

    const exclude = { excludeFromExport: true, excludeFromTimeline: true, excludeFromAlignment: true };
    const props = { top: image.top, left: image.left, angle: image.angle, width: image.getScaledWidth(), height: image.getScaledHeight(), lockRotation: true };

    const crop = createInstance(fabric.Cropper, { name: "crop_" + image.name, fill: "#ffffff", globalCompositeOperation: "overlay", ...props, ...exclude });
    const overlay = createInstance(fabric.Rect, { name: "overlay_" + image.name, selectable: false, fill: "#00000080", ...props, ...exclude });

    const verticals = Array.from({ length: 3 }, (_, index) => {
      const x = crop.left! + crop.width! * 0.25 * (index + 1);
      const line = createInstance(fabric.Line, [x, crop.top!, x, crop.top! + crop.height!], { name: `crop_v_${index}_${image.name}`, stroke: "#ffffff", selectable: false, evented: false, ...exclude });
      this.canvas.add(line);
      return line;
    });

    const horizontals = Array.from({ length: 3 }, (_, index) => {
      const y = crop.top! + crop.height! * 0.25 * (index + 1);
      const line = createInstance(fabric.Line, [crop.left!, y, crop.left! + crop.width!, y], { name: `crop_h_${index}_${image.name}`, stroke: "#ffffff", selectable: false, evented: false, ...exclude });
      this.canvas.add(line);
      return line;
    });

    const width = image.width!;
    const height = image.height!;
    const cropX = image.cropX!;
    const cropY = image.cropY!;
    const elementWidth = isVideoElement(element) ? element.videoWidth : element.naturalWidth;
    const elementHeight = isVideoElement(element) ? element.videoHeight : element.naturalHeight;

    image.set({ cropX: 0, cropY: 0, dirty: false, selectable: false, left: image.left! - cropX * image.scaleX!, top: image.top! - cropY * image.scaleY!, width: elementWidth, height: elementHeight });
    crop.set({ left: image.left! + cropX * image.scaleX!, top: image.top! + cropY * image.scaleY!, width: width * image.scaleX!, height: height * image.scaleY!, dirty: false, lockScalingFlip: true });
    overlay.set({ left: image.left, top: image.top, width: image.width! * image.scaleX!, height: image.height! * image.scaleY!, dirty: false });

    this.canvas.discardActiveObject().add(overlay, crop);
    this.canvas.setActiveObject(crop).requestRenderAll();

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

      this.canvas.requestRenderAll();
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
      const cropX = (crop.left! - image.left!) / image.scaleX!;
      const cropY = (crop.top! - image.top!) / image.scaleY!;
      const width = (crop.width! * crop.scaleX!) / image.scaleX!;
      const height = (crop.height! * crop.scaleY!) / image.scaleY!;

      image.set({ cropX: cropX, cropY: cropY, width: width, height: height, top: image.top! + cropY * image.scaleY!, left: image.left! + cropX * image.scaleX!, selectable: true });
      image.setCoords();

      this.canvas.remove(overlay, crop, ...verticals, ...horizontals);
      this.canvas.setActiveObject(image).requestRenderAll().fire("crop:start", { target: image });

      runInAction(() => (this.active = null));
    });
  }

  *cropObjectWithClipPath(image: fabric.Image) {
    this.canvas.fire("crop:start", { target: image });
    const index = this.canvas._objects.findIndex((object) => object === image);
    this.active = image;

    const clipPath = image.clipPath!;
    const element = image.getElement() as HTMLImageElement;

    const left = image.left!;
    const top = image.top!;
    const x = image.cropX! * image.scaleX!;
    const y = image.cropY! * image.scaleY!;

    image.off("moving");
    image.off("scaling");
    image.off("rotating");

    image.set({ left: left - x, top: top - y, width: element.naturalWidth, height: element.naturalHeight, cropX: 0, cropY: 0, opacity: 0.35 });
    image.set({ dirty: false, clipPath: undefined, lockRotation: true, lockScalingFlip: true });

    const clone: fabric.Image = yield createInstance(Promise, (resolve) =>
      image.clone((clone: fabric.Image) => {
        clone.set({ name: "clone_" + image.name, scaleX: image.scaleX, scaleY: image.scaleY, clipPath: clipPath, opacity: 1 });
        clone.set({ selectable: false, evented: false, excludeFromAlignment: true, excludeFromExport: true, excludeFromTimeline: true });
        this.canvas!.insertAt(clone, index + 1, false);
        resolve(clone);
      }),
    );

    image.on("moving", () => {
      const imageHeight = image.getScaledHeight();
      const imageWidth = image.getScaledWidth();
      const clipPathHeight = clipPath.getScaledHeight();
      const clipPathWidth = clipPath.getScaledWidth();

      if (image.left! >= clipPath.left!) image.left = clipPath.left!;
      if (image.top! >= clipPath.top!) image.top = clipPath.top!;
      if (image.left! + imageWidth <= clipPath.left! + clipPathWidth) image.left = clipPath.left! - (imageWidth - clipPathWidth);
      if (image.top! + imageHeight <= clipPath.top! + clipPathHeight) image.top = clipPath.top! - (imageHeight - clipPathHeight);

      clone.left = image.left;
      clone.top = image.top;
    });

    image.on("scaling", () => {
      clone.scaleX = image.scaleX;
      clone.scaleY = image.scaleY;
      clone.left = image.left;
      clone.top = image.top;
    });

    image.on("mouseup", () => {
      if (image.left! > clipPath.left!) {
        const offsetX = image.left! - clipPath.left!;
        const scaleX = offsetX / image.width!;
        image.set({ left: clipPath.left, scaleX: image.scaleX! + scaleX });
      }

      if (image.top! > clipPath.top!) {
        const offsetY = image.top! - clipPath.top!;
        const scaleY = offsetY / image.height!;
        image.set({ top: clipPath.top, scaleY: image.scaleY! + scaleY });
      }

      if (image.left! + image.getScaledWidth() < clipPath.left! + clipPath.getScaledWidth()) {
        const offsetX = clipPath.left! + clipPath.getScaledWidth() - (image.left! + image.getScaledWidth());
        const scaleX = offsetX / image.width!;
        image.set({ scaleX: Math.abs(image.scaleX! + scaleX) });
      }

      if (image.top! + image.getScaledHeight() < clipPath.top! + clipPath.getScaledHeight()) {
        const offsetY = clipPath.top! + clipPath.getScaledHeight() - (image.top! + image.getScaledHeight());
        const scaleY = offsetY / image.height!;
        image.set({ scaleY: Math.abs(image.scaleY! + scaleY) });
      }

      const originalAspectRatio = image.width! / image.height!;
      const scaledAspectRatio = image.getScaledWidth() / image.getScaledHeight();
      const difference = originalAspectRatio - scaledAspectRatio;

      if (difference > 0.025) {
        image.set({ scaleX: image.scaleY });
      }

      if (difference < 0.025) {
        image.set({ scaleY: image.scaleX });
      }

      clone.scaleX = image.scaleX;
      clone.scaleY = image.scaleY;
      clone.left = image.left;
      clone.top = image.top;
    });

    image.on("deselected", () => {
      const cropX = (clipPath.left! - image.left!) / image.scaleX!;
      const cropY = (clipPath.top! - image.top!) / image.scaleY!;
      const width = (clipPath.width! * clipPath.scaleX!) / image.scaleX!;
      const height = (clipPath.height! * clipPath.scaleY!) / image.scaleY!;

      image.set({ cropX: cropX, cropY: cropY, width: width, height: height, top: clipPath.top!, left: clipPath.left!, clipPath: clipPath });
      image.set({ lockRotation: false, lockScalingFlip: false, opacity: 1 });

      image.off("scaling");
      image.off("deselected");
      image.off("moving");

      FabricUtils.bindObjectTransformToParent(image, [clipPath]);
      const handler = () => FabricUtils.updateObjectTransformToParent(image, [{ object: clipPath }]);
      image.on("moving", handler);
      image.on("scaling", handler);
      image.on("rotating", handler);
      handler();

      this.canvas.remove(clone);
      this.canvas.requestRenderAll().fire("crop:end", { target: image });

      runInAction(() => (this.active = null));
    });
  }
}
