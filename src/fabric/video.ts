import { createInstance } from "@/lib/utils";
import { fabric } from "fabric";

const FabricVideo = fabric.util.createClass(fabric.Image, {
  type: "video",
  playing: false,

  initialize: function (element: HTMLVideoElement, options?: any) {
    options = options || {};

    this.callSuper("initialize", element, options);
    this.set({ left: options.left ?? 0, top: options.top ?? 0, objectCaching: false });

    element.currentTime = 0;
    element.crossOrigin = options.crossOrigin;

    element.loop = options.loop ?? false;
    element.muted = options.muted ?? true;

    this.on("added", () => {
      fabric.util.requestAnimFrame(this.update.bind(this));
    });
  },

  get duration(): number {
    const element = this._originalElement as HTMLVideoElement;
    return element ? element.duration : 0;
  },

  play: function () {
    const element = this._originalElement as HTMLVideoElement;
    this.playing = true;
    element.play();
  },

  pause: function () {
    const element = this._originalElement as HTMLVideoElement;
    this.playing = false;
    element.pause();
  },

  seek: function (seconds: number) {
    const element = this._originalElement as HTMLVideoElement;
    element.currentTime = seconds < 0 ? 0 : seconds > element.duration ? element.duration : seconds;
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

FabricVideo.fromURL = function (url: string, callback: (video: fabric.Video) => void, options?: any) {
  const element = document.createElement("video");
  element.src = url;
  element.crossOrigin = options.crossOrigin;
  element.addEventListener("loadedmetadata", () => {
    element.height = element.videoHeight;
    element.width = element.videoWidth;
    callback(createInstance(FabricVideo, element, options));
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
          "fabric.Image.filters"
        );
      }
    }),
  ]).then(([filters]) => {
    FabricVideo.fromURL(
      object.src,
      (video: fabric.Video) => {
        callback(video);
      },
      { ...object, filters }
    );
  });
};

fabric.Video = FabricVideo;
