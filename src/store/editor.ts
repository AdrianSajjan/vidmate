import { makeAutoObservable } from "mobx";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import { convertBufferToWaveBlob, dataURLToUInt8Array } from "@/lib/media";
import { createInstance, createUint8Array } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { fetchExtensionByCodec } from "@/constants/recorder";
import { EditorAudioElement } from "@/types/editor";
import { FabricUtils } from "@/fabric/utils";

export type EditorStatus = "uninitialized" | "pending" | "complete" | "error";

export type ExportMode = "video" | "both";

export interface EditorProgress {
  audio: number;
  capture: number;
  compile: number;
  combine: number;
}

export enum ExportProgress {
  None = 0,
  Error = 1,
  Completed = 2,
  RenderScene = 3,
  CaptureVideo = 4,
  CompileVideo = 5,
  CaptureAudio = 6,
  CombineMedia = 7,
}

export class Editor {
  page: number;
  pages: Canvas[];
  status: EditorStatus;

  sidebarLeft: string | null;
  sidebarRight: string | null;
  isTimelineOpen: boolean;

  blob?: Blob;
  frame?: string;

  file: string;
  fps: string;
  codec: string;
  exports: ExportMode;

  preview: boolean;
  progress: EditorProgress;

  ffmpeg: FFmpeg;
  exporting: ExportProgress;
  controller: AbortController;

  constructor() {
    this.page = 0;
    this.status = "uninitialized";

    this.pages = [createInstance(Canvas)];
    this.controller = createInstance(AbortController);

    this.preview = false;
    this.progress = { audio: 0, capture: 0, combine: 0, compile: 0 };

    this.file = "";
    this.fps = "30";
    this.codec = "H.264";
    this.exports = "both";

    this.exporting = ExportProgress.None;
    this.ffmpeg = createInstance(FFmpeg);

    this.sidebarLeft = null;
    this.sidebarRight = null;
    this.isTimelineOpen = false;

    makeAutoObservable(this);
  }

  get canvas() {
    return this.pages[this.page];
  }

  private onFFmpegExecProgress({ progress }: { progress: number }) {
    switch (this.exporting) {
      case ExportProgress.CaptureAudio:
        this.progress.audio = progress * 100;
        break;
      case ExportProgress.CompileVideo:
        this.progress.compile = progress * 100;
        break;
      case ExportProgress.CombineMedia:
        this.progress.combine = progress * 100;
        break;
    }
  }

  *onInitialize() {
    this.status = "pending";
    try {
      yield this.ffmpeg.load({
        coreURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js", "text/javascript"),
        wasmURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm", "application/wasm"),
      });
      this.ffmpeg.on("progress", this.onFFmpegExecProgress.bind(this));
      this.status = "complete";
    } catch (error) {
      this.status = "error";
    }
  }

  onCaptureFrame() {
    return this.canvas.recorder!.toDataURL({ format: "image/png" });
  }

  *onCaptureFrames() {
    const frames: Uint8Array[] = [];
    const interval = 1000 / +this.fps;
    const count = this.canvas.duration / interval;

    this.onChangeExportStatus(ExportProgress.CaptureVideo);

    for (let frame = 0; frame < count; frame++) {
      this.controller.signal.throwIfAborted();
      const seek = frame === count - 1 ? this.canvas.duration : (frame / count) * this.canvas.duration;

      this.canvas.timeline!.seek(seek);
      yield this.canvas.onToggleRecorderCanvasElements(seek);

      const base64 = this.onCaptureFrame();
      const buffer = dataURLToUInt8Array(base64);

      this.frame = base64;
      this.progress.capture = ((frame + 1) / count) * 100;

      frames.push(buffer);
    }

    return frames;
  }

  *onCompileFrames(frames: Uint8Array[], audio?: Blob) {
    if (!this.ffmpeg.loaded) throw createInstance(Error, "Ffmpeg is not loaded");

    let cleanup = 0;

    const pattern = "output_frame_%d.png";
    const codec = fetchExtensionByCodec(this.codec);

    const music = "output_audio.wav";
    const temporary = "output_temporary." + codec.extension;
    const output = audio ? "output_with_audio." + codec.extension : "output_without_audio." + codec.extension;

    try {
      this.onChangeExportStatus(ExportProgress.CompileVideo);

      for (let frame = 0; frame < frames.length; frame++) {
        this.controller.signal.throwIfAborted();
        const name = pattern.replace("%d", String(frame));
        yield this.ffmpeg.writeFile(name, frames[frame], { signal: this.controller.signal });
        cleanup = frame;
      }

      yield this.ffmpeg.exec(["-framerate", this.fps, "-i", pattern, "-c:v", codec.command, "-preset", "ultrafast", "-pix_fmt", "yuv420p", temporary], undefined, { signal: this.controller.signal });

      if (audio) {
        this.onChangeExportStatus(ExportProgress.CombineMedia);
        const buffer: ArrayBuffer = yield audio.arrayBuffer();

        yield this.ffmpeg.writeFile(music, createUint8Array(buffer), { signal: this.controller.signal });
        yield this.ffmpeg.exec(["-i", temporary, "-i", music, "-c:v", "copy", "-c:a", "aac", "-strict", "experimental", output], undefined, { signal: this.controller.signal });
        const data: Uint8Array = yield this.ffmpeg.readFile(output, undefined, { signal: this.controller.signal });

        this.controller.signal.throwIfAborted();
        this.onChangeExportStatus(ExportProgress.Completed);
        const blob = createInstance(Blob, [data.buffer], { type: codec.mimetype });

        return blob;
      } else {
        yield this.ffmpeg.rename(temporary, output, { signal: this.controller.signal });
        const data: Uint8Array = yield this.ffmpeg.readFile(output, undefined, { signal: this.controller.signal });

        this.progress.combine = 100;
        this.controller.signal.throwIfAborted();

        this.onChangeExportStatus(ExportProgress.Completed);
        const blob = createInstance(Blob, [data.buffer], { type: codec.mimetype });

        return blob;
      }
    } finally {
      try {
        for (let frame = 0; frame <= cleanup; frame++) {
          const name = pattern.replace("%d", String(frame));
          yield this.ffmpeg.deleteFile(name);
        }
        yield this.ffmpeg.deleteFile(output);
        if (audio) {
          yield this.ffmpeg.deleteFile(temporary);
          yield this.ffmpeg.deleteFile(music);
        }
      } catch {
        console.warn("FFMPEG - Failed to perform cleanup");
      }
    }
  }

  *onExtractAudioTracks() {
    const result: EditorAudioElement[] = [];

    for (const object of this.canvas.instance!._objects) {
      if (!FabricUtils.isVideoElement(object) || !object.hasAudio) continue;

      this.controller.signal.throwIfAborted();
      const input = object.name!;
      const output = object.name! + ".wav";

      const file: Uint8Array = yield fetchFile(object.getSrc());
      yield this.ffmpeg.writeFile(input, file);
      yield this.ffmpeg.exec(["-i", input, "-q:a", "0", "-map", "a", output], undefined, { signal: this.controller.signal });

      const data: Uint8Array = yield this.ffmpeg.readFile(output);
      const buffer: AudioBuffer = yield this.canvas.audioContext.decodeAudioData(data.buffer);

      const id = FabricUtils.elementID("audio");
      const duration = buffer.duration;

      const muted = object.muted();
      const volume = object.volume();

      const trim = object.trimStart / 1000;
      const offset = object.meta!.offset / 1000;
      const timeline = object.meta!.duration / 1000 - object.trimStart / 1000 - object.trimEnd / 1000;

      const source = this.canvas.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.canvas.audioContext.destination);

      result.push({ id, buffer, duration, muted, volume, source, offset, timeline, trim, name: output, playing: false, url: "" });
    }

    return result;
  }

  *onExportAudio() {
    if (this.exports === "video") {
      this.progress.audio = 100;
      return null;
    }

    this.controller = createInstance(AbortController);
    this.onChangeExportStatus(ExportProgress.CaptureAudio);

    const tracks: EditorAudioElement[] = yield this.onExtractAudioTracks();
    const audios = this.canvas.audios.filter((audio) => !audio.muted && !!audio.volume);
    const combined = ([] as EditorAudioElement[]).concat(audios, tracks);

    if (!combined.length) {
      this.progress.audio = 100;
      return null;
    }

    const sampleRate = combined[0].buffer.sampleRate;
    const duration = combined.reduce((duration, audio) => (audio.timeline + audio.offset > duration ? audio.timeline + audio.offset : duration), 0);
    const length = Math.min(duration, this.canvas.duration / 1000) * sampleRate;

    const context = createInstance(OfflineAudioContext, 2, length, sampleRate);
    this.canvas.onStartRecordAudio(combined, context);

    const handler = () => this.canvas.onStopRecordAudio(audios);
    this.controller.signal.addEventListener("abort", handler);

    const buffer: AudioBuffer = yield context.startRendering();
    this.controller.signal.throwIfAborted();

    this.controller.signal.removeEventListener("abort", handler);
    const blob = convertBufferToWaveBlob(buffer, buffer.length);
    this.progress.audio = 100;

    return blob;
  }

  *onExportVideo() {
    this.blob = undefined;
    this.frame = undefined;

    try {
      this.onResetProgress();

      const audio: Blob = yield this.onExportAudio();
      this.controller = createInstance(AbortController);

      this.onChangeExportStatus(ExportProgress.RenderScene);
      yield this.canvas.onStartRecordVideo();

      const frames: Uint8Array[] = yield this.onCaptureFrames();
      this.canvas.onStopRecordVideo();

      const blob: Blob = yield this.onCompileFrames(frames, audio);
      this.controller.signal.throwIfAborted();
      this.blob = blob;

      return blob;
    } catch (error) {
      this.canvas.onStopRecordVideo();
      this.onChangeExportStatus(ExportProgress.Error);
      throw error;
    }
  }

  onResetProgress() {
    this.progress = { audio: 0, capture: 0, combine: 0, compile: 0 };
  }

  onChangeExportStatus(status: ExportProgress) {
    this.exporting = status;
  }

  onChangeExportCodec(codec: string) {
    this.codec = codec;
  }

  onChangeExportFPS(fps: string) {
    this.fps = fps;
  }

  onChangeExportMode(mode: ExportMode) {
    this.exports = mode;
  }

  onChangeFileName(name: string) {
    this.file = name;
  }

  onTogglePreviewModal(mode: "open" | "close") {
    switch (mode) {
      case "open":
        this.preview = true;
        break;
      case "close":
        this.preview = false;
        if (this.exporting > 2) this.controller.abort({ message: "Export process cancelled by user" });
        break;
    }
  }

  onToggleTimeline(mode?: "open" | "close") {
    switch (mode) {
      case "close":
        this.isTimelineOpen = false;
        break;
      case "open":
        this.isTimelineOpen = true;
        break;
      default:
        this.isTimelineOpen = !this.isTimelineOpen;
        break;
    }
  }

  setActiveSidebarLeft(sidebar: string | null) {
    this.sidebarLeft = sidebar;
  }

  setActiveSidebarRight(sidebar: string | null) {
    this.sidebarRight = sidebar;
  }

  onAddPage() {
    this.pages.push(createInstance(Canvas));
  }
}
