import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";

export class CanvasClipMask {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  get canvas() {
    return this._canvas.instance!;
  }
}
