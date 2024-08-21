import { propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { createPromise } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { cloneDeep, cloneDeepWith } from "lodash";
import { makeAutoObservable } from "mobx";

export class CanvasClone {
  private _canvas: Canvas;
  private _clipboard: fabric.Object | null;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._clipboard = null;
    makeAutoObservable(this);
  }

  _resolver(_: unknown, key: string | number | undefined) {
    switch (key) {
      case "clipPath":
        return null;
      case "filters":
        return null;
    }
  }

  *copy(_object?: fabric.Object) {
    const object = _object || this._canvas.instance.getActiveObject();
    this._clipboard = object;
  }

  *paste() {
    if (!this._clipboard) return;

    const name = FabricUtils.elementID(this._clipboard.name!.split("_").at(0) || "clone");
    const meta = cloneDeep(this._clipboard.meta);
    const anim = cloneDeepWith(this._clipboard.anim, this._resolver);

    console.log(anim);

    const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => this._clipboard!.clone(resolve, propertiesToInclude));
    clone.set({ name: name, top: clone.top! + 10, left: clone.left! + 10, meta: meta, anim: anim, clipPath: undefined });

    if (this._clipboard.clipPath) {
      this._canvas.history.active = false;

      const clipPath: fabric.Object = yield createPromise<fabric.Object>((resolve) => this._clipboard!.clipPath!.clone(resolve, propertiesToInclude));
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

  *clone(object?: fabric.Object) {
    yield this.copy(object);
    yield this.paste();
    this.destroy();
  }

  destroy() {
    this._clipboard = null;
  }
}
