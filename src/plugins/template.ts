import { FabricUtils } from "@/fabric/utils";
import { createPromise } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { EditorTemplatePage } from "@/types/editor";
import { makeAutoObservable, runInAction } from "mobx";

export class CanvasTemplate {
  private _canvas: Canvas;
  status: "idle" | "pending" | "completed" | "error";
  page: EditorTemplatePage | null;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this.status = "idle";
    this.page = null;
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance;
  }

  private get artboard() {
    return this._canvas.artboard;
  }

  private get history() {
    return this._canvas.history;
  }

  private get workspace() {
    return this._canvas.workspace;
  }

  get pending() {
    return !(this.status === "completed" || this.status === "error") && !!this.page;
  }

  set(template: EditorTemplatePage) {
    this.page = template;
  }

  *load() {
    return createPromise<void>((resolve, reject) => {
      runInAction(() => {
        this.status = "pending";
        if (!this.page) {
          this.status = "error";
          reject();
        } else {
          this.canvas.loadFromJSON(this.page.data, () => {
            this.canvas.insertAt(this.artboard, 0, false);
            this.canvas.clipPath = this.artboard;
            this.workspace.resizeArtboard({ height: this.page!.height, width: this.page!.width });
            FabricUtils.applyTransformationsAfterLoad(this.canvas);
            this.history.clear();
            this.canvas.renderAll();
            this.status = "completed";
            resolve();
          });
        }
      });
    });
  }
}
