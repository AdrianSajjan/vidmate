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
        case "Backspace":
          this._canvas.onDeleteActiveObject();
          break;
        case "z":
          if (event.ctrlKey || event.metaKey) {
            if (event.metaKey && event.shiftKey) this._canvas.history.redo();
            else this._canvas.history.undo();
          }
          break;
        case "y":
          if (event.ctrlKey || event.metaKey) {
            this._canvas.history.redo();
          }
          break;
        case "c":
          if (event.ctrlKey || event.metaKey) {
            this._canvas.cloner.copy();
          }
          break;
        case "v":
          if (event.ctrlKey || event.metaKey) {
            this._canvas.cloner.paste();
          }
          break;
      }
    });
  }

  private _initializeEvents() {
    window.addEventListener("keydown", this._keyDownEvent.bind(this));
  }

  destroy() {
    window.removeEventListener("keydown", this._keyDownEvent);
  }
}
