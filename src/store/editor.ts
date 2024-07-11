import { makeAutoObservable } from "mobx";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

import { dataURLToUInt8Array } from "@/lib/media";
import { createInstance, wait } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

export type VideoCodec = "webm" | "mp4";
export type AudioCodec = "wav" | "mp3";
export type EditorStatus = "uninitialized" | "pending" | "complete" | "error";

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

  *onCompileFrames(frames: Uint8Array[], fps: number, width: number, height: number) {
    if (!this.ffmpeg.loaded) throw createInstance(Error, "Ffmpeg is not loaded");

    for (let frame = 0; frame < frames.length; frame++) {
      this.controller.signal.throwIfAborted();
      const name = "frame_" + String(frame) + ".png";
      yield this.ffmpeg.writeFile(name, frames[frame]);
    }

    yield this.ffmpeg.exec(["-framerate", String(fps), "-i", "frame_%d.png", "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "output.mp4"], undefined, { signal: this.controller.signal });
    const data: Uint8Array = yield this.ffmpeg.readFile("output.mp4");
    const blob = createInstance(Blob, [data.buffer], { type: "video/mp4" });

    return blob;
  }

  *onExportVideo(_codec: VideoCodec = "mp4", fps = 30) {
    this.blob = undefined;
    this.frame = undefined;

    try {
      const interval = 1000 / fps;
      const frames: Uint8Array[] = [];
      const count = this.canvas.duration / interval;

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

      const blob: Blob = yield this.onCompileFrames(frames, fps, this.canvas.width, this.canvas.height);
      this.blob = blob;

      this.onChangeExportStatus(ExportProgress.Completed);
      return blob;
    } catch (error) {
      this.canvas.onStopRecordVideo();
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
        if (this.exporting > 3) this.controller.abort("Action cancelled by user");
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
