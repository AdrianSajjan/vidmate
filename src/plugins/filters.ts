import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";

export class CanvasEffects {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  removeImageFilter(image: fabric.Image, name: string) {
    if (!image || !(image.type === "image" || image.type === "video") || image.effects!.name !== name) return;

    image.effects!.name = null;
    image.effects!.intensity = null;

    if (image.effects!.start >= 0 && image.effects!.end >= 0) {
      image.filters!.splice(image.effects!.start, image.effects!.end);
    }

    image.effects!.end = null;
    image.effects!.start = null;
    image.applyFilters();
    this.canvas.fire("object:modified", { target: image }).requestRenderAll();
  }

  removeFilterFromActiveImage(name: string) {
    const image = this.canvas.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.removeImageFilter(image, name);
  }

  addImageFilter(image: fabric.Image, filter: fabric.IBaseFilter[], name: string, intensity: number) {
    if (!this.canvas || !image || (image.effects!.name === name && image.effects!.intensity === intensity)) return;

    image.effects!.name = name;
    image.effects!.intensity = intensity;

    if (image.effects!.start >= 0 && image.effects!.end >= 0) {
      image.filters!.splice(image.effects!.start, image.effects!.end);
    }

    image.effects!.start = image.filters!.length;
    image.effects!.end = image.filters!.length + filter.length;

    image.filters!.push(...filter);
    image.applyFilters();
    this.canvas.fire("object:modified", { target: image });
    this.canvas.requestRenderAll();
  }

  addFilterToActiveImage(filter: fabric.IBaseFilter[], name: string, intensity: number) {
    const image = this.canvas.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.addImageFilter(image, filter, name, intensity);
  }

  removeImageAdjustment(image: fabric.Image, name: string) {
    if (!this.canvas || !image || !(image.type === "image" || image.type === "video") || !image.adjustments![name]) return;

    if (image.adjustments![name].index >= 0) image.filters!.splice(image.adjustments![name].index, 1);
    image.applyFilters();
    image.adjustments![name] = null;
    this.canvas.fire("object:modified", { target: image });
    this.canvas.requestRenderAll();
  }

  removeAdjustmentFromActiveImage(name: string) {
    const image = this.canvas.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.removeImageAdjustment(image, name);
  }

  applyImageAdjustment(image: fabric.Image, filter: fabric.IBaseFilter, name: string, intensity: number) {
    if (!image || !(image.type === "image" || image.type === "video")) return;

    if (!image.adjustments![name]) image.adjustments![name] = {};
    const adjustment = image.adjustments![name];

    if (adjustment.name === name && adjustment.intensity === intensity) return;

    adjustment.name = name;
    adjustment.intensity = intensity;

    if (adjustment.index >= 0) image.filters!.splice(adjustment.index, 1);
    adjustment.index = image.filters!.length;

    image.filters!.push(filter);
    image.applyFilters();
    this.canvas.fire("object:modified", { target: image });
    this.canvas.requestRenderAll();
  }

  applyAdjustmentToActiveImage(filter: fabric.IBaseFilter, name: string, intensity: number) {
    const image = this.canvas.getActiveObject() as fabric.Image;
    if (!image || !(image.type === "image" || image.type === "video")) return;
    this.applyImageAdjustment(image, filter, name, intensity);
  }
}
