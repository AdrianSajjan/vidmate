import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";
import { fabric } from "fabric";
import { FabricUtils } from "@/fabric/utils";

const _fabric = fabric as any;

export class CanvasClipMask {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  get canvas() {
    return this._canvas.instance!;
  }

  clipObjectFromSceneElement(image: fabric.Image, clipPath: fabric.Object) {
    const index = this.canvas._objects.findIndex((object) => object === image);
    if (index === -1) return;

    const height = clipPath.getScaledHeight();
    const width = clipPath.getScaledWidth();

    clipPath.set({ absolutePositioned: true }).moveTo(index);
    width > height ? image.scaleToWidth(width) : image.scaleToHeight(height);
    image.set({ clipPath: clipPath }).setPositionByOrigin(clipPath.getCenterPoint(), "center", "center");

    const group = [clipPath.name, image.name];
    clipPath.meta!.group = group;
    image.meta!.group = group;

    this.canvas.requestRenderAll();
    this.canvas.fire("clip:added", { target: image });
  }

  clipActiveObjectFromSceneElement(clipPath: fabric.Object) {
    const object = this.canvas.getActiveObject() as fabric.Image | fabric.Video;
    if (!object || !(object.type === "image" || object.type === "video")) return;
    this.clipObjectFromSceneElement(object, clipPath);
  }

  clipObjectFromBasicShape(image: fabric.Image, klass: string, params: any) {
    const name = FabricUtils.elementID(klass);
    const height = image.getScaledHeight();
    const width = image.getScaledWidth();

    const clip: fabric.Object = createInstance(_fabric[klass], { name, ...params, absolutePositioned: true });
    const shell: fabric.Object = createInstance(_fabric[klass], { name, ...params, objectCaching: true, opacity: 0 });

    height > width ? shell.scaleToWidth(width) : shell.scaleToHeight(height);
    shell.setPositionByOrigin(image.getCenterPoint(), "center", "center");
    shell.setCoords();

    FabricUtils.initializeMetaProperties(shell);
    FabricUtils.initializeAnimationProperties(shell);
    FabricUtils.bindObjectTransformToParent(shell, [clip]);

    const handler = () => FabricUtils.updateObjectTransformToParent(shell, [{ object: clip, callback: () => image.set({ dirty: true }) }]);
    shell.on("moving", handler);
    shell.on("scaling", handler);
    shell.on("rotating", handler);
    handler();

    const group = [shell.name, image.name];
    shell.meta!.group = group;
    image.meta!.group = group;

    image.set({ clipPath: clip });
    this.canvas.add(shell);
    this.canvas.setActiveObject(image).requestRenderAll();
    this.canvas.fire("clip:added", { target: image });
  }

  clipActiveObjectFromBasicShape(klass: string, params: any) {
    const object = this.canvas.getActiveObject() as fabric.Image | fabric.Video;
    if (!object || !(object.type === "image" || object.type === "video")) return;
    this.clipObjectFromBasicShape(object, klass, params);
  }
}
