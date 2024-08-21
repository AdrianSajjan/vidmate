import { propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createPromise } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";

export class CanvasClone {
  private _canvas: Canvas;
  private _clipboard: fabric.Object | null;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._clipboard = null;
    makeAutoObservable(this);
  }

  *copy() {
    const object = this._canvas.instance.getActiveObject();
    if (!object) return;

    const name = FabricUtils.elementID(object!.name!.split("_").at(0) || "clone");
    const meta = structuredClone(object!.meta);
    const anim = structuredClone(object!.anim);

    const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => object!.clone(resolve, propertiesToInclude));
    clone.set({ name: name, top: clone.top!, left: clone.left!, meta: meta, anim: anim, clipPath: undefined }).setCoords();

    this._clipboard = clone;
  }

  *paste() {
    if (!this._clipboard) return;

    const object = this._clipboard;
    if (!object) return;

    const name = FabricUtils.elementID(object.name!.split("_").at(0) || "clone");
    const meta = structuredClone(object.meta);
    const anim = structuredClone(object.anim);

    const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clone(resolve, propertiesToInclude));
    clone.set({ name: name, top: clone.top! + 10, left: clone.left! + 10, meta: meta, anim: anim, clipPath: undefined }).setCoords();

    if (object.clipPath) {
      this._canvas.history.active = false;

      const clipPath: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clipPath!.clone(resolve, propertiesToInclude));
      clipPath.set({ name: FabricUtils.elementID(clipPath.name!.split("_").at(0) || "clone") });

      FabricUtils.bindObjectTransformToParent(clone, [clipPath]);
      const handler = () => FabricUtils.updateObjectTransformToParent(clone, [{ object: clipPath }]);

      clone.on("moving", handler);
      clone.on("scaling", handler);
      clone.on("rotating", handler);
      clone.set({ clipPath }).setCoords();

      this._canvas.instance.add(clipPath, clone);
      this._canvas.instance.setActiveObject(clone).requestRenderAll();
      this._canvas.history.active = true;

      this._canvas.instance.fire("object:modified", { target: clone });
      this._canvas.instance.fire("clip:added", { target: clone });
    } else {
      this._canvas.instance.add(clone);
      this._canvas.instance.setActiveObject(clone).requestRenderAll();
    }

    this._clipboard = clone;
  }

  clone() {
    this.copy();
    this.paste();
    this.destroy();
  }

  destroy() {
    this._clipboard = null;
  }
}
