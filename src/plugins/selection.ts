import { fabric } from "fabric";
import { makeAutoObservable, runInAction } from "mobx";

import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

import { EditorAudioElement } from "@/types/editor";
import { FabricUtils } from "@/fabric/utils";
import { propertiesToInclude } from "@/fabric/constants";

export class CanvasSelection {
  private _canvas: Canvas;
  active: fabric.Object | null;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this.active = null;

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _initEvents() {
    this.canvas.on("object:modified", this._modifiedEvent.bind(this));
    this.canvas.on("timeline:start", this._timelineRecorderStartEvent.bind(this));
    this.canvas.on("recorder:start", this._timelineRecorderStartEvent.bind(this));

    this.canvas.on("selection:created", this._selectionEvent.bind(this));
    this.canvas.on("selection:updated", this._selectionEvent.bind(this));
    this.canvas.on("selection:cleared", this._selectionEvent.bind(this));

    this.canvas.on("clip:added", this._modifiedEvent.bind(this));
    this.canvas.on("clip:removed", this._modifiedEvent.bind(this));
  }

  private _modifiedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!this.active || !event.target || this.active.name !== event.target.name) return;
      this.active = event.target.toObject(propertiesToInclude);
    });
  }

  private _timelineRecorderStartEvent() {
    runInAction(() => {
      this.canvas.discardActiveObject();
    });
  }

  private _selectionEvent() {
    runInAction(() => {
      const selection = this.canvas.getActiveObject();
      if (FabricUtils.isActiveSelection(this.active)) {
        const objects = this.active.objects.map((object) => this.canvas.getItemByName(object.name)).filter(Boolean) as fabric.Object[];
        objects.forEach((object) => object.set({ hasBorders: true, hasControls: true }));
      }
      if (!selection || selection.excludeFromTimeline) {
        this.active = null;
      } else if (FabricUtils.isActiveSelection(selection)) {
        selection.off("moving");
        selection.off("scaling");
        selection.off("rotating");
        let preserveAspectRatio = false;
        selection.forEachObject((object) => {
          object.set({ hasBorders: false, hasControls: false });
          if (["image", "video", "textbox"].includes(object.type!)) preserveAspectRatio = true;
          if (object.clipPath) {
            const handler = FabricUtils.updateObjectTransformToParent.bind(FabricUtils, object, [{ object: object.clipPath! }]);
            selection.on("moving", handler);
            selection.on("scaling", handler);
            selection.on("rotating", handler);
          }
        });
        selection.setControlsVisibility({ mt: !preserveAspectRatio, mb: !preserveAspectRatio, mr: !preserveAspectRatio, ml: !preserveAspectRatio });
        this.active = selection.toObject(propertiesToInclude);
      } else {
        this.active = selection.toObject(propertiesToInclude);
      }
      this.canvas.requestRenderAll();
    });
  }

  selectObjectByName(name: string, multiple?: boolean) {
    const object = this.canvas.getItemByName(name);
    if (!object) return;
    const selected = this.canvas.getActiveObject();
    if (!selected || !multiple) {
      this.canvas.setActiveObject(object);
    } else {
      if (FabricUtils.isActiveSelection(selected)) {
        if (object.group === selected) {
          if (selected._objects.length === 1) {
            this.canvas.discardActiveObject();
          } else {
            selected.removeWithUpdate(object);
            this.canvas.fire("selection:updated");
          }
        } else {
          selected.addWithUpdate(object);
          this.canvas.fire("selection:updated");
        }
      } else {
        if (selected.name !== object.name) {
          const activeSelection = createInstance(fabric.ActiveSelection, [selected, object], { canvas: this.canvas });
          this.canvas.setActiveObject(activeSelection);
        }
      }
    }
    this.canvas.requestRenderAll();
  }

  selectAudio(audio: EditorAudioElement | null) {
    if (!audio) {
      this.active = null;
    } else {
      this.canvas.discardActiveObject().requestRenderAll();
      this.active = Object.assign({ type: "audio" }, audio) as unknown as fabric.Object;
    }
  }

  selectMetaGroup(group: string[]) {
    if (!group.length) return;
    const elements = group.map((item) => this.canvas.getItemByName(item)).filter(Boolean) as fabric.Object[];
    const activeSelection = createInstance(fabric.ActiveSelection, elements, { canvas: this.canvas });
    this.canvas.setActiveObject(activeSelection).requestRenderAll();
  }
}
