import { propertiesToInclude } from "@/fabric/constants";
import { FabricUtils } from "@/fabric/utils";
import { Canvas } from "@/store/canvas";
import { EditorAudioElement, EditorTrim } from "@/types/editor";
import { makeAutoObservable, runInAction } from "mobx";

export class CanvasTrimmer {
  private _canvas: Canvas;
  active: EditorTrim;

  constructor(canvas: Canvas) {
    this.active = null;
    this._canvas = canvas;

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private get selection() {
    return this._canvas.selection;
  }

  private _initEvents() {
    this.canvas.on("timeline:start", this._timelineRecorderStartEvent.bind(this));
    this.canvas.on("recorder:start", this._timelineRecorderStartEvent.bind(this));
    this.canvas.on("object:modified", this._objectModifiedEvent.bind(this));
  }

  private _objectModifiedEvent(event: fabric.IEvent) {
    runInAction(() => {
      if (!event.target || !this.active) return;
      if (event.target.name === this.active.object.name) this.active.object = event.target.toObject(propertiesToInclude);
    });
  }

  private _timelineRecorderStartEvent() {
    runInAction(() => {
      this.active = null;
      this.canvas.discardActiveObject();
    });
  }

  private _trimAudioStart(audio: EditorAudioElement) {
    this.active = Object.assign({ type: "audio" as "audio" }, { object: audio });
  }

  private _trimAudioEnd() {
    this.active = null;
  }

  private _trimVideoStart(video: fabric.Video) {
    this.active = Object.assign({ type: "video" as "video" }, { object: video.toObject(propertiesToInclude) });
    video.on("deselected", () => this._trimVideoEnd());
  }

  private _trimVideoEnd() {
    const object = this._canvas.instance.getItemByName(this.active?.object.name);
    this.active = null;
    if (!FabricUtils.isVideoElement(object)) return;
    object.seek(this._canvas.timeline.seek);
    this._canvas.instance.requestRenderAll();
  }

  *split() {
    const object = this.selection.active;
    if (!object) return;
    if (FabricUtils.isVideoElement(object)) {
      const video = this.canvas.getItemByName(object.name) as fabric.Video;
      const clone: fabric.Video = yield this._canvas.onCloneObject(video);
      return clone;
    }
  }

  start() {
    const object = this.selection.active;
    if (!object) return;
    if (FabricUtils.isVideoElement(object)) {
      const video = this.canvas.getItemByName(object.name) as fabric.Video;
      this._trimVideoStart(video);
    }
    if (FabricUtils.isAudioElement(object)) {
      this._trimAudioStart(object);
    }
  }

  exit() {
    if (!this.active) return;
    else if (FabricUtils.isVideoElement(this.active.object)) this._trimVideoEnd();
    else if (FabricUtils.isAudioElement(this.active.object)) this._trimAudioEnd();
  }
}
