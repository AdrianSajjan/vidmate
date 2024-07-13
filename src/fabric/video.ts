import { checkForAudioInVideo } from "@/lib/media";
import { createInstance, createPromise, waitUntilEvent } from "@/lib/utils";
import { fabric } from "fabric";
import { clamp } from "lodash";

const FabricVideo = fabric.util.createClass(fabric.Image, {
  type: "video",
  playing: false,

  initialize: function (element: HTMLVideoElement, options?: fabric.IVideoOptions) {
    options = options || {};

    element.loop = false;
    element.currentTime = 0;
    element.muted = options.muted ?? false;
    element.crossOrigin = options.crossOrigin ?? null;

    this.callSuper("initialize", element, options);
    this.set({ left: options.left ?? 0, top: options.top ?? 0, trimStart: options.trimStart ?? 0, trimEnd: options.trimEnd ?? 0, hasAudio: options.hasAudio ?? false, objectCaching: false });
    this.on("added", () => fabric.util.requestAnimFrame(this.update.bind(this)));
  },

  muted: function () {
    const element = this._originalElement as HTMLVideoElement;
    return element ? element.muted : true;
  },

  duration: function (trim?: boolean) {
    const element = this._originalElement as HTMLVideoElement;
    return element ? (trim ? element.duration - this.trimStart - this.trimEnd : element.duration) : 0;
  },

  play: function () {
    this.playing = true;
    const element = this._originalElement as HTMLVideoElement;
    element.currentTime = this.trimStart;
    element.play();
  },

  pause: function () {
    this.playing = false;
    const element = this._originalElement as HTMLVideoElement;
    element.pause();
  },

  seek: async function (_seconds: number) {
    const element = this._originalElement as HTMLVideoElement;
    const seconds = _seconds + this.trimStart;
    element.currentTime = clamp(seconds, 0, this.duration(true));
    await waitUntilEvent(element, "seeked");
  },

  update: function () {
    if (this.canvas) {
      const backend = fabric.filterBackend;
      if (backend?.evictCachesForKey) {
        backend.evictCachesForKey(this.cacheKey);
        backend.evictCachesForKey(this.cacheKey + "_filtered");
      }
      this.applyFilters();
      this.canvas.renderAll();
      fabric.util.requestAnimFrame(this.update.bind(this));
    }
  },

  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper("_render", ctx);
  },
});

FabricVideo.fromURL = function (url: string, callback: (video: fabric.Video | null) => void, options?: fabric.IVideoOptions) {
  const element = document.createElement("video");
  element.currentTime = 0;
  element.crossOrigin = options?.crossOrigin ?? null;
  element.addEventListener(
    "loadeddata",
    async () => {
      element.height = element.videoHeight;
      element.width = element.videoWidth;
      const hasAudio = await checkForAudioInVideo(url);
      callback(createInstance(FabricVideo, element, Object.assign({ hasAudio }, options)));
    },
    { once: true },
  );
  element.addEventListener("error", () => callback(null), { once: true });
  element.src = url;
  element.load();
};

FabricVideo.fromObject = function (object: any, callback: (video: fabric.Video) => void) {
  Promise.all([
    createPromise<fabric.IBaseFilter[]>((resolve) => {
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

fabric.Video = FabricVideo;
