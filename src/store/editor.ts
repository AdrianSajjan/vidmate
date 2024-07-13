import { makeAutoObservable } from "mobx";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

import { convertBufferToWaveBlob, dataURLToUInt8Array } from "@/lib/media";
import { createInstance, createUint8Array } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { fetchExtensionByCodec } from "@/constants/recorder";

export type EditorStatus = "uninitialized" | "pending" | "complete" | "error";

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
  StaticCanvas = 3,
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

  audio: boolean;
  video: boolean;

  preview: boolean;
  progress: number;

  ffmpeg: FFmpeg;
  exporting: ExportProgress;
  controller: AbortController;

  constructor() {
    this.page = 0;
    this.status = "uninitialized";

    this.pages = [createInstance(Canvas)];
    this.controller = createInstance(AbortController);

    this.progress = 0;
    this.preview = false;

    this.file = "";
    this.fps = "30";
    this.codec = "H.264";

    this.video = true;
    this.audio = true;

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
    console.log(progress);
  }

  *onInitialize() {
    this.status = "pending";
    try {
      yield this.ffmpeg.load({
        coreURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js", "text/javascript"),
        wasmURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm", "application/wasm"),
      });
      this.ffmpeg.on("progress", this.onFFmpegExecProgress);
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
      this.progress = Math.ceil((frame / count) * 100);

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

      yield this.ffmpeg.exec(["-framerate", this.fps, "-i", pattern, "-c:v", codec.command, "-pix_fmt", "yuv420p", temporary], undefined, { signal: this.controller.signal });

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

        this.controller.signal.throwIfAborted();
        this.onChangeExportStatus(ExportProgress.Completed);

        const blob = createInstance(Blob, [data.buffer], { type: codec.mimetype });
        return blob;
      }
    } finally {
      try {
        yield this.ffmpeg.deleteFile(output);
        if (audio) {
          yield this.ffmpeg.deleteFile(music);
          yield this.ffmpeg.deleteFile(temporary);
        }
        for (let frame = 0; frame <= cleanup; frame++) {
          const name = pattern.replace("%d", String(frame));
          yield this.ffmpeg.deleteFile(name);
        }
      } catch {
        console.warn("FFMPEG - Failed to perform cleanup");
      }
    }
  }

  *onExportAudio() {
    if (!this.canvas.audios.length) return null;

    this.controller = createInstance(AbortController);
    this.onChangeExportStatus(ExportProgress.CaptureAudio);

    const sampleRate = this.canvas.audios[0].buffer.sampleRate;
    const duration = this.canvas.audios.reduce((duration, audio) => (audio.timeline + audio.offset > duration ? audio.timeline + audio.offset : duration), 0);
    const length = Math.min(duration, this.canvas.duration / 1000) * sampleRate;

    const context = createInstance(OfflineAudioContext, 2, length, sampleRate);
    this.canvas.onStartRecordAudio(context);

    this.controller.signal.addEventListener("abort", this.canvas.onStopRecordAudio.bind(this.canvas));
    const buffer: AudioBuffer = yield context.startRendering();
    this.controller.signal.throwIfAborted();

    this.controller.signal.removeEventListener("abort", this.canvas.onStopRecordAudio.bind(this.canvas));
    const blob = convertBufferToWaveBlob(buffer, buffer.length);

    if (!this.video) this.onChangeExportStatus(ExportProgress.Completed);
    return blob;
  }

  *onExportVideo() {
    this.blob = undefined;
    this.frame = undefined;

    try {
      const audio: Blob = this.audio ? yield this.onExportAudio() : null;
      this.controller = createInstance(AbortController);

      this.onChangeExportStatus(ExportProgress.StaticCanvas);
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

  onChangeExportStatus(status: ExportProgress) {
    this.exporting = status;
  }

  onChangeExportCodec(codec: string) {
    this.codec = codec;
  }

  onChangeExportFPS(fps: string) {
    this.fps = fps;
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
