import { checkForAudioInVideo } from "@/lib/media";
import { createInstance, createPromise, waitUntilEvent } from "@/lib/utils";
import { fabric } from "fabric";
import { clamp, isUndefined } from "lodash";

const Video = fabric.util.createClass(fabric.Image, {
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

  muted: function (value?: boolean) {
    const element = this._originalElement as HTMLVideoElement;
    if (!element) return true;
    if (isUndefined(value)) return element.muted;
    element.muted = value;
    return value;
  },

  volume: function (value?: number) {
    const element = this._originalElement as HTMLVideoElement;
    if (!this.hasAudio || !element) return 0;
    if (isUndefined(value)) return element.volume;
    element.volume = value;
    return value;
  },

  duration: function (trim?: boolean) {
    const element = this._originalElement as HTMLVideoElement;
    return element ? (trim ? element.duration - this.trimStart - this.trimEnd : element.duration) : 0;
  },

  play: async function () {
    if (this.playing) return;
    this.playing = true;
    const element = this._originalElement as HTMLVideoElement;
    element.currentTime = this.trimStart;
    await element.play();
  },

  pause: function () {
    if (!this.playing) return;
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

Video.fromURL = function (url: string, callback: (video: fabric.Video | null) => void, options?: fabric.IVideoOptions) {
  const element = document.createElement("video");

  element.currentTime = 0;
  element.playsInline = true;
  element.crossOrigin = options?.crossOrigin ?? null;

  element.onloadeddata = async () => {
    element.onloadeddata = null;
    element.onerror = null;

    element.height = element.videoHeight;
    element.width = element.videoWidth;

    const hasAudio = await checkForAudioInVideo(url);
    callback(createInstance(Video, element, Object.assign({ hasAudio }, options)));
  };
  element.onerror = () => {
    element.onloadeddata = null;
    element.onerror = null;
    callback(null);
  };

  element.src = url;
  element.load();
};

Video.fromElement = function (element: HTMLVideoElement, callback: (video: fabric.Video | null) => void, options?: fabric.IVideoOptions) {
  checkForAudioInVideo(element.src).then((hasAudio) => {
    callback(createInstance(Video, element, Object.assign({ hasAudio }, options)));
  });
};

Video.fromObject = function (object: fabric.Video, callback: (video: fabric.Video) => void) {
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
    createPromise<fabric.Object | undefined>((resolve) => {
      if (!object.clipPath) {
        resolve(undefined);
      } else {
        fabric.util.enlivenObjects(
          [object.clipPath],
          ([clipPath]: [fabric.Object]) => {
            resolve(clipPath);
          },
          "fabric",
        );
      }
    }),
  ]).then(([filters, clipPath]) => {
    Video.fromURL(
      object.src,
      (video: fabric.Video) => {
        callback(video);
      },
      { ...object, clipPath, filters },
    );
  });
};

fabric.Video = Video;
