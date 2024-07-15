import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise } from "@/lib/utils";
import { fabric } from "fabric";
import { Editor } from "@/store/editor";
import { propertiesToInclude } from "@/fabric/constants";
import anime from "animejs";
import { CanvasAnimations } from "@/plugins/animations";

export class Recorder {
  private _editor: Editor;

  instance!: fabric.StaticCanvas;
  timeline!: anime.AnimeTimelineInstance | null;

  constructor(editor: Editor) {
    this._editor = editor;
  }

  private get canvas() {
    return this._editor.canvas.instance!;
  }

  private get workspace() {
    return this._editor.canvas.workspace;
  }

  private get preview() {
    return this._editor.canvas.timeline;
  }

  private get artboard() {
    return this._editor.canvas.artboard!;
  }

  onInitialize(element: HTMLCanvasElement) {
    this.instance = createInstance(fabric.StaticCanvas, element);
  }

  onCaptureFrame() {
    return this.instance.toDataURL({ format: "image/png" });
  }

  *onToggleElements(ms: number) {
    for (const object of this.instance._objects) {
      if (FabricUtils.isElementExcluded(object)) continue;
      const hidden = object.meta!.offset > ms || object.meta!.offset + object.meta!.duration < ms;
      object.visible = !hidden;
      if (FabricUtils.isVideoElement(object) && !object.meta!.placeholder && !hidden) {
        yield object.seek((ms - object.meta!.offset) / 1000);
      }
    }
    this.instance.requestRenderAll();
  }

  *start() {
    this.canvas.fire("recorder:start");
    this.instance.setDimensions({ height: this.workspace.height, width: this.workspace.width });
    this.instance.clear();

    const artboard: fabric.Object = yield createPromise<fabric.Object>((resolve) => this.artboard.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
    this.instance.add(artboard);
    for (const object of this.instance._objects) {
      if (FabricUtils.isElementExcluded(object)) continue;
      const clone: fabric.Object = yield createPromise<fabric.Object>((resolve) => object.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
      this.instance.add(clone);
    }
    this.instance.renderAll();

    this.timeline = anime.timeline({ duration: this.preview.duration, loop: false, autoplay: false, update: this.instance.requestRenderAll.bind(this.instance) });
    CanvasAnimations.initializeAnimations(this.instance, this.timeline, this.preview.duration);
  }

  stop() {
    this.canvas.fire("recorder:stop");
    anime.remove(this.timeline);
    this.instance.clear();
    this.timeline = null;
  }
}
