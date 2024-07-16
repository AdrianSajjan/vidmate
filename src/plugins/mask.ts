import { Canvas } from "@/store/canvas";

export class CanvasClipMask {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  get canvas() {
    return this._canvas.instance!;
  }
}
