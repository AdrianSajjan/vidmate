import { makeAutoObservable, runInAction } from "mobx";
import { propertiesToInclude } from "@/fabric/constants";
import { createPromise } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { FabricUtils } from "@/fabric/utils";

type HistoryStatus = "pending" | "idle";

export class CanvasHistory {
  private _canvas: Canvas;

  private _undo: string[];
  private _redo: string[];

  status: HistoryStatus;
  active: boolean;

  constructor(canvas: Canvas) {
    this.status = "idle";
    this.active = true;

    this._canvas = canvas;
    const history = this._next();

    this._undo = [history];
    this._redo = [];

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _next() {
    return JSON.stringify(this.canvas.toDatalessJSON(propertiesToInclude));
  }

  private *_load(history: string) {
    return createPromise<void>((resolve) => {
      FabricUtils.applyFontsBeforeLoad(JSON.parse(history).objects).then(() => {
        this.canvas.loadFromJSON(history, () => {
          runInAction(() => {
            this.canvas.insertAt(this._canvas.artboard, 0, false);
            FabricUtils.applyTransformationsAfterLoad(this.canvas);
            this.status = "idle";
            this.canvas.renderAll();
            resolve();
          });
        });
      });
    });
  }

  private _saveHistoryEvent(event: fabric.IEvent) {
    if (!event.target || !this.active || event.target.excludeFromTimeline || event.target.excludeFromExport || this.status === "pending") return;
    const json = this._next();
    if (json !== this._undo[this.undo.length - 1]) runInAction(() => this._undo.push(json));
  }

  private _initEvents() {
    this.canvas.on("object:added", this._saveHistoryEvent.bind(this));
    this.canvas.on("object:modified", this._saveHistoryEvent.bind(this));
    this.canvas.on("object:removed", this._saveHistoryEvent.bind(this));
    this.canvas.on("object:skewing", this._saveHistoryEvent.bind(this));
  }

  get canUndo() {
    return this._undo.length > 1 && this.status === "idle";
  }

  get canRedo() {
    return this._redo.length > 0 && this.status === "idle";
  }

  *undo() {
    if (!this.canUndo) return;
    this.status = "pending";
    const current = this._undo.pop()!;
    const history = this._undo.pop();
    if (history) {
      this._redo.push(current);
      yield this._load(history);
    } else {
      this.status = "idle";
    }
  }

  *redo() {
    if (!this.canRedo) return;
    this.status = "pending";
    const history = this._redo.pop();
    if (history) {
      this._undo.push(this._next());
      yield this._load(history);
    } else {
      this.status = "idle";
    }
  }

  clear() {
    const undo = this._undo.pop();
    this._undo = undo ? Array(undo) : Array(this._next());
    this._redo = [];
  }
}
