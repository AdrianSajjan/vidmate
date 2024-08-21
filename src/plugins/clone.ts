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

  copy() {}

  paste() {}

  clone() {
    this.copy();
    this.paste();
    this.destroy();
  }

  destroy() {
    this._clipboard = null;
  }
}
