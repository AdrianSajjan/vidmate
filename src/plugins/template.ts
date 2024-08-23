import { fabric } from "fabric";
import { makeAutoObservable, runInAction } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createPromise } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { EditorTemplatePage } from "@/types/editor";

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

  private get editor() {
    return this._canvas.editor;
  }

  private get artboard() {
    return this._canvas.artboard;
  }

  private get history() {
    return this._canvas.history;
  }

  private get timeline() {
    return this._canvas.timeline;
  }

  private get selection() {
    return this._canvas.selection;
  }

  private get cropper() {
    return this._canvas.selection;
  }

  private get audio() {
    return this._canvas.audio;
  }

  private get workspace() {
    return this._canvas.workspace;
  }

  get pending() {
    return !(this.status === "completed" || this.status === "error") && !!this.page;
  }

  private *_scene() {
    this.canvas.clear();
    this.timeline.destroy();

    this.workspace.changeFill("#CCCCCC");
    this.workspace.resizeArtboard({ height: this.page!.data.height, width: this.page!.data.width });

    this.canvas.add(this.artboard);
    this.canvas.clipPath = this.artboard;
    const serialized = JSON.parse(this.page!.data.scene);

    return createPromise<void>((resolve) => {
      FabricUtils.applyFontsBeforeLoad(serialized.objects).then(() => {
        fabric.util.enlivenObjects(
          serialized.objects,
          (objects: fabric.Object[]) => {
            FabricUtils.applyModificationsAfterLoad(objects, this.editor.adapter, this.editor.mode).then(() => {
              runInAction(() => {
                this.canvas.add(...objects);
                this.workspace.changeFill(this.page!.data.fill || "#FFFFFF");
                this.workspace.resizeArtboard({ height: this.page!.data.height || 1080, width: this.page!.data.width || 1080 });

                this.history.clear();
                this.timeline.initialize(this.page!.duration || 5000);

                FabricUtils.applyTransformationsAfterLoad(this.canvas);
                this.canvas.renderAll();
                this.status = "completed";

                resolve();
              });
            });
          },
          "fabric",
        );
      });
    });
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
          this.audio.elements = [];
          this._canvas.elements = [];

          this._canvas.id = this.page.id;
          this._canvas.name = this.page.name;

          this.cropper.active = null;
          this.selection.active = null;

          Promise.all([this.audio.initialize(this.page!.data.audios), this._scene()])
            .then(() => resolve())
            .catch(() => reject());
        }
      });
    });
  }
}
