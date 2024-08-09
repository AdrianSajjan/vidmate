import { fabric } from "fabric";
import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";

export class CanvasText {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  animated(textbox: fabric.Textbox) {
    console.log(this.canvas, textbox);
  }
}
