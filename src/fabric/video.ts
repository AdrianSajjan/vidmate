import { createInstance } from "@/lib/utils";
import { fabric } from "fabric";
import { clamp } from "lodash";

const FabricVideo = fabric.util.createClass(fabric.Image, {
  type: "video",
  playing: false,
  trimLeft: 0,
  trimRight: 0,

  initialize: function (element: HTMLVideoElement, options?: any) {
    options = options || {};

    this.callSuper("initialize", element, options);
    this.set({ left: options.left ?? 0, top: options.top ?? 0, objectCaching: false });

    element.loop = false;
    element.currentTime = 0;

    element.muted = options.muted ?? true;
    element.crossOrigin = options.crossOrigin;

    this.on("added", () => {
      fabric.util.requestAnimFrame(this.update.bind(this));
    });
  },

  duration: function (trim?: boolean) {
    const element = this._originalElement as HTMLVideoElement;
    return element ? (trim ? element.duration - this.trimLeft - this.trimRight : element.duration) : 0;
  },

  play: function () {
    this.playing = true;
    const element = this._originalElement as HTMLVideoElement;
    element.currentTime = this.trimLeft;
    element.play();
  },

  pause: function () {
    this.playing = false;
    const element = this._originalElement as HTMLVideoElement;
    element.pause();
  },

  seek: function (_seconds: number) {
    const element = this._originalElement as HTMLVideoElement;
    const seconds = _seconds + this.trimLeft;
    element.currentTime = clamp(seconds, 0, this.duration(true));
    if (this.canvas) this.canvas.requestRenderAll();
  },

  update: function () {
    if (this.canvas) {
      const backend = fabric.filterBackend;
      if (backend?.evictCachesForKey) {
        backend.evictCachesForKey(this.cacheKey);
        backend.evictCachesForKey(this.cacheKey + "_filtered");
      }
      this.applyFilters();
      this.canvas.requestRenderAll();
      fabric.util.requestAnimFrame(this.update.bind(this));
    }
  },

  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper("_render", ctx);
  },
});

FabricVideo.fromURL = function (url: string, callback: (video: fabric.Video | null) => void, options?: any) {
  const element = document.createElement("video");
  element.src = url;
  element.currentTime = 0;
  element.crossOrigin = options.crossOrigin;
  element.addEventListener("loadeddata", () => {
    element.height = element.videoHeight;
    element.width = element.videoWidth;
    callback(createInstance(FabricVideo, element, options));
  });
  element.addEventListener("error", () => {
    callback(null);
  });
  element.load();
};

FabricVideo.fromObject = function (object: any, callback: (video: fabric.Video) => void) {
  Promise.all([
    createInstance(Promise<fabric.IBaseFilter[]>, (resolve) => {
      if (!object.filters?.length) {
        resolve([]);
      } else {
        fabric.util.enlivenObjects(
          object.filters,
          (filters: fabric.IBaseFilter[]) => {
            resolve(filters);
          },
          "fabric.Image.filters",
        );
      }
    }),
  ]).then(([filters]) => {
    FabricVideo.fromURL(
      object.src,
      (video: fabric.Video) => {
        callback(video);
      },
      { ...object, filters },
    );
  });
};

FabricVideo.toObject = function (properties: any[]) {
  return fabric.Object.prototype.toObject.call(this, ["trimLeft", "trimRight"].concat(properties));
};

fabric.Video = FabricVideo;
