import { createInstance } from "@/lib/utils";
import { fabric } from "fabric";

const FabricVideo = fabric.util.createClass(fabric.Image, {
  type: "video",
  playing: false,

  initialize: function (element: HTMLVideoElement, options?: any) {
    options = options || {};
    this.callSuper("initialize", element, options);
    this.set({ left: options.left || 0, top: options.top || 0, objectCaching: false });

    element.crossOrigin = options.crossOrigin;
    element.loop = options.loop ?? true;
    element.muted = options.muted ?? true;
    element.currentTime = 0.1;

    this.on("added", () => {
      fabric.util.requestAnimFrame(this.update.bind(this));
    });
  },

  play: function () {
    const element = this._element as HTMLVideoElement;
    this.playing = true;
    element.play();
  },

  pause: function () {
    const element = this._element as HTMLVideoElement;
    this.playing = false;
    element.pause();
  },

  seek: function (seconds: number) {
    const element = this._element as HTMLVideoElement;
    if (seconds < 0 || seconds > element.duration) return;
    element.currentTime = seconds;
    this.canvas?.requestRenderAll();
  },

  update: function () {
    if (this.canvas) {
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
  FabricVideo.fromURL(
    object.src,
    (video: fabric.Video) => {
      callback(video);
    },
    object
  );
};

fabric.Video = FabricVideo;
