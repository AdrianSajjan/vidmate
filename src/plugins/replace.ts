import { FabricUtils } from "@/fabric/utils";
import { checkForAudioInVideo } from "@/lib/media";
import { createPromise } from "@/lib/utils";
import { rmbgAI } from "@/models/rmbg";
import { Canvas } from "@/store/canvas";
import { EditorReplace } from "@/types/editor";
import { fabric } from "fabric";
import { makeAutoObservable, runInAction } from "mobx";

export class CanvasReplace {
  private _canvas: Canvas;
  active: EditorReplace;

  constructor(canvas: Canvas) {
    this.active = null;
    this._canvas = canvas;
    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _initEvents() {
    this.canvas.on("selection:cleared", this._selectionEvent.bind(this));
    this.canvas.on("selection:updated", this._selectionEvent.bind(this));
    this.canvas.on("timeline:start", this._timelineRecorderStartEvent.bind(this));
    this.canvas.on("recorder:start", this._timelineRecorderStartEvent.bind(this));
  }

  private _selectionEvent() {
    runInAction(() => {
      this.active = null;
    });
  }

  private _timelineRecorderStartEvent() {
    runInAction(() => {
      this.active = null;
      this.canvas.discardActiveObject();
    });
  }

  *replaceImage(image: fabric.Image, source: string) {
    image.meta!.replacing = true;
    return createPromise<fabric.Image>((resolve, reject) => {
      fabric.util.loadImage(
        source,
        (element) => {
          if (!element || !element.height || !element.width) {
            reject();
          } else {
            image.setElement(element);
            image.meta!.replacing = false;
            image.set({ scaleX: image.scaleX, scaleY: image.scaleY, left: image.left, top: image.top, angle: image.angle, cropX: image.cropX, cropY: image.cropY });

            this.canvas.requestRenderAll();
            resolve(image);
          }
        },
        null,
        "anonymous",
      );
    });
  }

  *replaceVideo(video: fabric.Video, source: string) {
    video.meta!.replacing = true;
    return createPromise<fabric.Video>((resolve, reject) => {
      fabric.util.loadVideo(
        source,
        async (element) => {
          if (!element || !element.height || !element.width) {
            reject();
          } else {
            const hasAudio = await checkForAudioInVideo(source);

            element.loop = false;
            element.currentTime = 0;

            element.muted = video.muted() ?? false;
            element.crossOrigin = video.crossOrigin ?? null;

            video.setElement(element);
            video.meta!.replacing = false;
            video.set({ scaleX: video.scaleX, scaleY: video.scaleY, left: video.left, top: video.top, angle: video.angle, cropX: video.cropX, cropY: video.cropY, hasAudio: hasAudio });

            this.canvas.requestRenderAll();
            resolve(video);
          }
        },
        null,
        "anonymous",
      );
    });
  }

  mark(object?: fabric.Object | null) {
    if (!object) this.active = null;
    if (FabricUtils.isImageElement(object)) this.active = { type: "image", object };
    if (FabricUtils.isVideoElement(object)) this.active = { type: "video", object };
    if (FabricUtils.isAudioElement(object)) this.active = { type: "audio", object };
    return this.active;
  }

  *replace(source: string, cache?: boolean) {
    if (!this.active) return;
    switch (this.active.type) {
      case "image":
        this.replaceImage(this.active.object, source);
        if (cache) rmbgAI.removeCacheEntry(this.active.object.name!);
        break;
      case "video":
        this.replaceVideo(this.active.object, source);
        break;
    }

    this.active = null;
  }
}
