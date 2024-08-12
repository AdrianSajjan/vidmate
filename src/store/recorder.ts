import anime from "animejs";
import { fabric } from "fabric";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { makeAutoObservable } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createInstance, createPromise, createUint8Array, wait } from "@/lib/utils";
import { Editor } from "@/store/editor";
import { propertiesToInclude } from "@/fabric/constants";
import { dataURLToUInt8Array } from "@/lib/media";
import { fetchExtensionByCodec } from "@/constants/recorder";

export class Recorder {
  private _editor: Editor;

  instance!: fabric.StaticCanvas;
  timeline!: anime.AnimeTimelineInstance | null;

  constructor(editor: Editor) {
    this._editor = editor;
    makeAutoObservable(this);
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

  private get animations() {
    return this._editor.canvas.animations;
  }

  private *_toggleElement(object: fabric.Object, ms: number) {
    const hidden = object.meta!.offset > ms || object.meta!.offset + object.meta!.duration < ms;
    object.visible = FabricUtils.isTextboxElement(object) ? false : !hidden;
    if (object.clipPath) object.clipPath.visible = object.visible;
    if (FabricUtils.isVideoElement(object) && !object.meta!.placeholder && !hidden) {
      yield object.seek((ms - object.meta!.offset) / 1000);
    }
  }

  private *_toggleElements(ms: number) {
    for (const object of this.instance._objects) {
      if (!object.excludeFromTimeline || FabricUtils.isAnimatedTextElement(object)) {
        this._toggleElement(object, ms);
      }
    }
    this.instance.requestRenderAll();
  }

  initialize(element: HTMLCanvasElement) {
    this.instance = createInstance(fabric.StaticCanvas, element, { renderOnAddRemove: false });
  }

  *compile(frames: Uint8Array[], { ffmpeg, fps = "60", codec = "H.264", audio, signal }: { ffmpeg: FFmpeg; fps?: string; codec?: string; signal?: AbortSignal; audio?: Blob }) {
    if (!ffmpeg.loaded) throw createInstance(Error, "Ffmpeg is not loaded");

    let cleanup = 0;
    const { command, extension, mimetype } = fetchExtensionByCodec(codec);

    const music = "output_audio.wav";
    const pattern = "output_frame_%d.png";

    const temporary = "output_temporary." + extension;
    const output = audio ? "output_with_audio." + extension : "output_without_audio." + extension;

    try {
      for (let frame = 0; frame < frames.length; frame++) {
        signal?.throwIfAborted();
        const name = pattern.replace("%d", String(frame));
        yield ffmpeg.writeFile(name, frames[frame], { signal });
        cleanup = frame;
      }

      if (audio) {
        const buffer: ArrayBuffer = yield audio.arrayBuffer();
        yield ffmpeg.writeFile(music, createUint8Array(buffer), { signal });
        yield ffmpeg.exec(["-framerate", fps, "-i", pattern, "-i", music, "-c:v", command, "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", output], undefined, { signal });
        const data: Uint8Array = yield ffmpeg.readFile(output, undefined, { signal });
        return createInstance(Blob, [data.buffer], { type: mimetype });
      }

      yield ffmpeg.exec(["-framerate", fps, "-i", pattern, "-c:v", command, "-preset", "ultrafast", "-pix_fmt", "yuv420p", output], undefined, { signal });
      const data: Uint8Array = yield ffmpeg.readFile(output, undefined, { signal });
      return createInstance(Blob, [data.buffer], { type: mimetype });
    } finally {
      try {
        for (let frame = 0; frame <= cleanup; frame++) {
          const name = pattern.replace("%d", String(frame));
          yield ffmpeg.deleteFile(name);
        }
        yield ffmpeg.deleteFile(output);
        if (audio) {
          yield ffmpeg.deleteFile(music);
          yield ffmpeg.deleteFile(temporary);
        }
      } catch {
        console.warn("FFMPEG - Failed to perform cleanup");
      }
    }
  }

  *capture(fps: number, { progress, signal }: { progress?: (value: { progress: number; frame: string }) => void; signal?: AbortSignal }) {
    const interval = 1000 / fps;
    const frames: Uint8Array[] = [];
    const count = this.preview.duration / interval;

    for (let frame = 0; frame < count; frame++) {
      const seek = frame === count - 1 ? this.preview.duration : (frame / count) * this.preview.duration;
      this.timeline!.seek(seek);
      yield Promise.all([this._toggleElements(seek), wait(0.1)]);

      const base64 = this.instance.toDataURL({ format: "image/png" });
      const buffer = dataURLToUInt8Array(base64);
      frames.push(buffer);

      progress?.({ progress: (frame + 1) / count, frame: base64 });
      signal?.throwIfAborted();
    }

    return frames;
  }

  *screenshot(canvas = this.canvas) {
    this.instance.setDimensions({ height: this.workspace.height, width: this.workspace.width });
    this.instance.clear();

    const json = canvas.toDatalessJSON(propertiesToInclude);
    yield createPromise<void>((resolve) => this.instance.loadFromJSON(json, resolve));

    const artboard: fabric.Object = yield createPromise<fabric.Object>((resolve) => this.artboard.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
    this.instance.insertAt(artboard, 0, false);
    this.instance.clipPath = artboard;

    FabricUtils.applyTransformationsAfterLoad(this.instance);
    this.instance.renderAll();

    const base64 = this.instance.toDataURL({ format: "image/png" });
    this.instance.clear();

    return base64;
  }

  *start() {
    this.canvas.fire("recorder:start");
    this.instance.setDimensions({ height: this.workspace.height, width: this.workspace.width });
    this.instance.clear();

    const json = this.canvas.toDatalessJSON(propertiesToInclude);
    yield createPromise<void>((resolve) => this.instance.loadFromJSON(json, resolve));

    const artboard: fabric.Object = yield createPromise<fabric.Object>((resolve) => this.artboard.clone((clone: fabric.Object) => resolve(clone), propertiesToInclude));
    this.instance.insertAt(artboard, 0, false);
    this.instance.clipPath = artboard;

    FabricUtils.applyTransformationsAfterLoad(this.instance);
    this.instance.renderAll();

    this.timeline = anime.timeline({ duration: this.preview.duration, loop: false, autoplay: false, update: this.instance.renderAll.bind(this.instance) });
    this.animations.initialize(this.instance, this.timeline, this.preview.duration);
  }

  stop() {
    this.canvas.fire("recorder:stop");
    anime.remove(this.timeline);
    this.instance.clear();
    this.timeline = null;
  }

  destroy() {
    this.instance?.dispose();
  }
}
