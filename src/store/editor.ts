import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { makeAutoObservable } from "mobx";

import { Canvas } from "@/store/canvas";
import { Recorder } from "@/store/recorder";

import { convertBufferToWaveBlob } from "@/lib/media";
import { createInstance } from "@/lib/utils";
import { EditorAudioElement } from "@/types/editor";

export type ExportMode = "video" | "both";
export type EditorStatus = "uninitialized" | "pending" | "complete" | "error";

export interface EditorProgress {
  capture: number;
  compile: number;
}

export enum ExportProgress {
  None = 0,
  Error = 1,
  Completed = 2,
  CaptureAudio = 3,
  CaptureVideo = 4,
  CompileVideo = 5,
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
  recorder: Recorder;
  progress: EditorProgress;

  ffmpeg: FFmpeg;
  exporting: ExportProgress;
  controller: AbortController;

  constructor() {
    this.page = 0;
    this.status = "uninitialized";

    this.pages = [createInstance(Canvas)];
    this.recorder = createInstance(Recorder, this);
    this.controller = createInstance(AbortController);

    this.preview = false;
    this.progress = { capture: 0, compile: 0 };

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

  private _progressEvent({ progress, frame }: { progress: number; frame?: string }) {
    switch (this.exporting) {
      case ExportProgress.CaptureVideo:
        this.progress.capture = progress * 100;
        this.frame = frame;
        break;
      case ExportProgress.CompileVideo:
        this.progress.compile = progress * 100;
        break;
    }
  }

  *initialize() {
    this.status = "pending";
    try {
      yield this.ffmpeg.load({
        coreURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js", "text/javascript"),
        wasmURL: yield toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm", "application/wasm"),
      });
      this.ffmpeg.on("progress", this._progressEvent.bind(this));
      this.status = "complete";
    } catch (error) {
      this.status = "error";
    }
  }

  *exportAudio() {
    if (this.exports === "video") return null;
    this.controller = createInstance(AbortController);

    const tracks: EditorAudioElement[] = yield this.canvas.audio.extract(this.ffmpeg, { signal: this.controller.signal });
    const audios = this.canvas.audio.elements.filter((audio) => !audio.muted && !!audio.volume);
    const combined = ([] as EditorAudioElement[]).concat(audios, tracks);

    if (!combined.length) return null;

    const sampleRate = combined[0].buffer.sampleRate;
    const duration = combined.reduce((duration, audio) => (audio.timeline + audio.offset > duration ? audio.timeline + audio.offset : duration), 0);
    const length = Math.min(duration, this.canvas.timeline.duration / 1000) * sampleRate;

    const context = createInstance(OfflineAudioContext, 2, length, sampleRate);
    this.canvas.audio.record(combined, context);
    const handler = () => this.canvas.audio.stop(audios);
    this.controller.signal.addEventListener("abort", handler);

    const buffer: AudioBuffer = yield context.startRendering();
    this.controller.signal.throwIfAborted();
    this.controller.signal.removeEventListener("abort", handler);
    const blob = convertBufferToWaveBlob(buffer, buffer.length);

    return blob;
  }

  *exportVideo() {
    this.blob = undefined;
    this.frame = undefined;
    this.onResetProgress();

    try {
      this.onChangeExportStatus(ExportProgress.CaptureAudio);
      const audio: Blob = yield this.exportAudio();
      this.controller = createInstance(AbortController);
      yield this.recorder.start();
      this.onChangeExportStatus(ExportProgress.CaptureVideo);
      const frames: Uint8Array[] = yield this.recorder.capture(+this.fps, { signal: this.controller.signal, progress: this._progressEvent.bind(this) });
      this.recorder.stop();

      this.onChangeExportStatus(ExportProgress.CompileVideo);
      const blob: Blob = yield this.recorder.compile(frames, { ffmpeg: this.ffmpeg, codec: this.codec, fps: this.fps, signal: this.controller.signal, audio });

      return blob;
    } catch (error) {
      this.recorder.stop();
      this.onChangeExportStatus(ExportProgress.Error);
      throw error;
    }
  }

  onResetProgress() {
    this.progress = { capture: 0, compile: 0 };
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

  setActiveSidebarLeft(sidebar: string | null) {
    this.sidebarLeft = sidebar;
  }

  setActiveSidebarRight(sidebar: string | null) {
    this.sidebarRight = sidebar;
  }

  onAddPage() {
    this.pages.push(createInstance(Canvas));
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
}
