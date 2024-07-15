import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";

interface CanvasJSON {
  version: string;
  objects: fabric.Object[];
}

type HistoryStatus = "pending" | "idle";

export class CanvasHistory {
  private _canvas: Canvas;

  undo: CanvasJSON[];
  redo: CanvasJSON[];

  enabled: boolean;
  status: HistoryStatus;

  constructor(canvas: Canvas) {
    this.undo = [];
    this.redo = [];

    this.enabled = true;
    this.status = "idle";

    this._canvas = canvas;
    makeAutoObservable(this);
  }

  get canvas() {
    return this._canvas.instance!;
  }
}
