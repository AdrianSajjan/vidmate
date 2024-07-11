import { makeAutoObservable } from "mobx";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

import { convertBufferToWaveBlob, dataURLToUInt8Array } from "@/lib/media";
import { createInstance, createUint8Array, wait } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

export type EditorStatus = "uninitialized" | "pending" | "complete" | "error";

export interface ExportAudio {
  fps?: number;
  audio?: boolean;
}

export interface CompileFrames {
  fps: number;
  frames: Uint8Array[];
  audio?: Blob | null;
  dimensions?: Record<"height" | "width", number>;
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

  *onInitialize() {
    this.status = "pending";
    try {
      yield this.ffmpeg.load({
        coreURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js", "text/javascript"),
        wasmURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm", "application/wasm"),
      });
      this.status = "complete";
    } catch (error) {
      this.status = "error";
    }
  }

  onCaptureFrame() {
    return this.canvas.recorder!.toDataURL({ format: "image/png" });
  }

  *onCompileFrames({ frames, fps, audio, dimensions }: CompileFrames) {
    if (!this.ffmpeg.loaded) throw createInstance(Error, "Ffmpeg is not loaded");

    let cleanup = 0;

    try {
      for (let frame = 0; frame < frames.length; frame++) {
        this.controller.signal.throwIfAborted();
        const name = "frame_" + String(frame) + ".png";
        yield this.ffmpeg.writeFile(name, frames[frame], { signal: this.controller.signal });
        cleanup = frame;
      }

      if (dimensions) {
        const { height, width } = dimensions;
        yield this.ffmpeg.exec(["-framerate", String(fps), "-i", "frame_%d.png", "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "output.mp4"], undefined, { signal: this.controller.signal });
      } else {
        yield this.ffmpeg.exec(["-framerate", String(fps), "-i", "frame_%d.png", "-c:v", "libx264", "-pix_fmt", "yuv420p", "output.mp4"], undefined, { signal: this.controller.signal });
      }

      if (audio) {
        this.onChangeExportStatus(ExportProgress.CombineMedia);
        const buffer: ArrayBuffer = yield audio.arrayBuffer();
        yield this.ffmpeg.writeFile("audio.wav", createUint8Array(buffer), { signal: this.controller.signal });
        yield this.ffmpeg.exec(["-i", "output.mp4", "-i", "audio.wav", "-c:v", "copy", "-c:a", "aac", "-strict", "experimental", "output_with_audio.mp4"], undefined, { signal: this.controller.signal });
        const data: Uint8Array = yield this.ffmpeg.readFile("output_with_audio.mp4", undefined, { signal: this.controller.signal });
        this.controller.signal.throwIfAborted();
        const blob = createInstance(Blob, [data.buffer], { type: "video/mp4" });
        return blob;
      } else {
        const data: Uint8Array = yield this.ffmpeg.readFile("output.mp4", undefined, { signal: this.controller.signal });
        this.controller.signal.throwIfAborted();
        const blob = createInstance(Blob, [data.buffer], { type: "video/mp4" });
        return blob;
      }
    } finally {
      try {
        yield this.ffmpeg.deleteFile("output.mp4");
        if (audio) {
          yield this.ffmpeg.deleteFile("audio.wav");
          yield this.ffmpeg.deleteFile("output_with_audio.mp4");
        }
        for (let frame = 0; frame <= cleanup; frame++) {
          const name = "frame_" + String(frame) + ".png";
          yield this.ffmpeg.deleteFile(name);
        }
      } catch {
        console.warn("FFMPEG - Failed to perform cleanup");
      }
    }
  }

  *onExportAudio(video?: boolean) {
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

    if (!video) this.onChangeExportStatus(ExportProgress.Completed);
    return blob;
  }

  *onExportVideo(props?: ExportAudio) {
    this.blob = undefined;
    this.frame = undefined;

    const fps = props?.fps || 30;
    const sound = props?.audio || true;

    try {
      const interval = 1000 / fps;
      const frames: Uint8Array[] = [];
      const count = this.canvas.duration / interval;

      const audio: Blob | null = sound ? yield this.onExportAudio() : null;

      this.controller = createInstance(AbortController);
      this.onChangeExportStatus(ExportProgress.StaticCanvas);

      yield this.canvas.onStartRecordVideo();
      this.onChangeExportStatus(ExportProgress.CaptureVideo);

      for (let frame = 0; frame < count; frame++) {
        this.controller.signal.throwIfAborted();
        const seek = (frame / count) * this.canvas.duration;

        this.canvas.timeline!.seek(seek);
        this.canvas.onToggleCanvasElements(seek, this.canvas.recorder);

        const base64 = this.onCaptureFrame();
        const buffer = dataURLToUInt8Array(base64);

        this.frame = base64;
        this.progress = Math.ceil((frame / count) * 100);

        frames.push(buffer);
        yield wait(interval);
      }

      this.onChangeExportStatus(ExportProgress.CompileVideo);
      this.canvas.onStopRecordVideo();

      const blob: Blob = yield this.onCompileFrames({ frames, fps, audio });
      this.controller.signal.throwIfAborted();
      this.blob = blob;

      this.onChangeExportStatus(ExportProgress.Completed);
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

  onTogglePreviewModal(mode: "open" | "close") {
    switch (mode) {
      case "open":
        this.preview = true;
        break;
      case "close":
        this.preview = false;
        if (this.exporting > 2) this.controller.abort({ message: "Video export interrupted by user" });
        break;
    }
  }

  setActiveSidebarLeft(sidebar: string | null) {
    this.sidebarLeft = sidebar;
  }

  setActiveSidebarRight(sidebar: string | null) {
    this.sidebarRight = sidebar;
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

  onAddPage() {
    this.pages.push(createInstance(Canvas));
  }
}
