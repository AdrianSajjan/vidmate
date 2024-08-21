import { Canvas } from "@/store/canvas";
import { makeAutoObservable, runInAction } from "mobx";

export class CanvasHotkeys {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._initializeEvents();
    makeAutoObservable(this);
  }

  private _keyDownEvent(event: KeyboardEvent) {
    runInAction(() => {
      switch (event.key) {
        case "Delete":
          this._canvas.onDeleteActiveObject();
          break;
        case "z":
          if (event.ctrlKey || event.metaKey) {
            // TODO: Implement undo functionality
          }
          break;
        case "y":
          if (event.ctrlKey || event.metaKey) {
            // TODO: Implement redo functionality
          }
          break;
        case "c":
          if (event.ctrlKey || event.metaKey) {
            // TODO: Implement copy functionality
          }
          break;
        case "v":
          if (event.ctrlKey || event.metaKey) {
            // TODO: Implement paste functionality
          }
          break;
      }
    });
  }

  private _initializeEvents() {
    window.addEventListener("keydown", this._keyDownEvent);
  }

  destroy() {
    window.removeEventListener("keydown", this._keyDownEvent);
  }
}