import { makeAutoObservable } from "mobx";
import { fabric } from "fabric";

import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { FabricUtils } from "@/fabric/utils";

const _fabric = fabric as any;

export class CanvasClipMask {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _crop(image: fabric.Image, clip: fabric.Object) {
    const cropX = (clip.left! - image.left!) / image.scaleX!;
    const cropY = (clip.top! - image.top!) / image.scaleY!;
    const width = (clip.width! * clip.scaleX!) / image.scaleX!;
    const height = (clip.height! * clip.scaleY!) / image.scaleY!;
    image.set({ height, width, cropX, cropY, top: clip.top, left: clip.left });
  }

  clipObjectFromSceneElement(image: fabric.Image, clip: fabric.Object) {
    const height = clip.getScaledHeight();
    const width = clip.getScaledWidth();

    const props = { absolutePositioned: true, opacity: 0.01, selectable: false, evented: false, excludeFromTimeline: true, excludeFromAlignment: true };
    clip.set(props);

    height > width ? image.scaleToHeight(height / 2) : image.scaleToWidth(width / 2);
    image.setPositionByOrigin(clip.getCenterPoint(), "center", "center");
    image.setCoords();

    this._crop(image, clip);
    FabricUtils.bindObjectTransformToParent(image, [clip]);
    const handler = () => FabricUtils.updateObjectTransformToParent(image, [{ object: clip }]);

    image.on("moving", handler);
    image.on("scaling", handler);
    image.on("rotating", handler);
    handler();

    image.set({ clipPath: clip }).setCoords();
    this.canvas.setActiveObject(image).requestRenderAll();
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

    const props = { absolutePositioned: true, opacity: 0.01, selectable: false, evented: false, excludeFromTimeline: true, excludeFromAlignment: true };
    const clip: fabric.Object = createInstance(_fabric[klass], { name, ...params, ...props });

    height > width ? clip.scaleToWidth(width) : clip.scaleToHeight(height);
    clip.setPositionByOrigin(image.getCenterPoint(), "center", "center");
    clip.setCoords();

    this._crop(image, clip);
    FabricUtils.initializeMetaProperties(clip);
    FabricUtils.initializeAnimationProperties(clip);
    FabricUtils.bindObjectTransformToParent(image, [clip]);

    const handler = () => FabricUtils.updateObjectTransformToParent(image, [{ object: clip }]);
    image.on("moving", handler);
    image.on("scaling", handler);
    image.on("rotating", handler);
    handler();

    image.set({ clipPath: clip }).setCoords();
    this.canvas.add(clip);
    this.canvas.setActiveObject(image).requestRenderAll();
    this.canvas.fire("clip:added", { target: image });
  }

  clipActiveObjectFromBasicShape(klass: string, params: any) {
    const object = this.canvas.getActiveObject() as fabric.Image | fabric.Video;
    if (!object || !(object.type === "image" || object.type === "video")) return;
    this.clipObjectFromBasicShape(object, klass, params);
  }
}
