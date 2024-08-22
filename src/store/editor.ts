import { nanoid } from "nanoid";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { makeAutoObservable } from "mobx";

import { Canvas } from "@/store/canvas";
import { Prompt } from "@/store/prompt";
import { Recorder } from "@/store/recorder";

import { convertBufferToWaveBlob } from "@/lib/media";
import { createInstance } from "@/lib/utils";
import { FabricUtils } from "@/fabric/utils";
import { propertiesToInclude } from "@/fabric/constants";
import { EditorAudioElement, EditorTemplate, EditorTemplatePage } from "@/types/editor";
import { Adapter } from "@/store/adapter";

export type ExportMode = "video" | "both";
export type EditorMode = "creator" | "adapter";
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
  id: string;
  name: string;
  mode: EditorMode;

  page: number;
  pages: Canvas[];
  status: EditorStatus;

  sidebarLeft: string | null;
  sidebarRight: string | null;
  timelineOpen: boolean;

  blob?: Blob;
  frame?: string;

  file: string;
  fps: string;
  codec: string;

  saving: boolean;
  preview: boolean;

  exports: ExportMode;
  progress: EditorProgress;

  prompter: Prompt;
  recorder: Recorder;
  adapter: Adapter;

  ffmpeg: FFmpeg;
  exporting: ExportProgress;
  controller: AbortController;

  constructor() {
    this.page = 0;
    this.id = nanoid();

    this.mode = "adapter";
    this.name = "Untitled Template";
    this.status = "uninitialized";

    this.pages = [createInstance(Canvas, this)];
    this.controller = createInstance(AbortController);

    this.adapter = createInstance(Adapter);
    this.prompter = createInstance(Prompt, this);
    this.recorder = createInstance(Recorder, this);

    this.saving = false;
    this.preview = false;

    this.exporting = ExportProgress.None;
    this.ffmpeg = createInstance(FFmpeg);
    this.progress = { capture: 0, compile: 0 };

    this.file = "";
    this.fps = "30";
    this.codec = "H.264";
    this.exports = "both";

    this.sidebarLeft = null;
    this.sidebarRight = null;
    this.timelineOpen = false;
    makeAutoObservable(this);
  }

  get canvas() {
    return this.pages[this.page];
  }

  private _progressEvent({ progress, frame }: { progress: number; frame?: string }) {
    switch (this.exporting) {
      case ExportProgress.CaptureVideo:
        this.progress.capture = progress * 100;
        if (frame) this.frame = frame;
        break;
      case ExportProgress.CompileVideo:
        this.progress.compile = progress * 100;
        break;
    }
  }

  *initialize(mode: EditorMode) {
    try {
      this.mode = mode;
      this.status = "pending";
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

    const audios = this.canvas.audio.elements.filter((audio) => !audio.muted && !!audio.volume);
    const videos = this.canvas.instance._objects.filter(FabricUtils.isVideoElement) as fabric.Video[];
    const tracks: EditorAudioElement[] = yield this.canvas.audio.extract(videos, { ffmpeg: this.ffmpeg, signal: this.controller.signal });

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
      this.onChangeExportStatus(ExportProgress.Completed);
      return blob;
    } catch (error) {
      this.onChangeExportStatus(ExportProgress.Error);
      this.recorder.stop();
      throw error;
    }
  }

  *exportTemplate() {
    const templates: EditorTemplatePage[] = [];
    for (const page of this.pages) {
      const thumbnail: string = yield this.recorder.screenshot(page.instance);
      const scene = JSON.stringify(page.instance.toDatalessJSON(propertiesToInclude));
      const audios: Omit<EditorAudioElement, "buffer" | "source">[] = page.audio.elements.map(({ buffer, source, ...audio }) => audio);
      const data = { fill: page.workspace.fill, height: page.workspace.height, width: page.workspace.width, audios: audios, scene: scene };
      templates.push({ thumbnail: thumbnail, data: data, id: page.id, name: page.name, duration: page.timeline.duration });
    }
    return templates;
  }

  loadTemplate(template: EditorTemplate, mode: "replace" | "reset") {
    switch (mode) {
      case "reset":
        this.id = template.id;
        this.name = template.name;
        for (let index = 0; index < template.pages.length; index++) {
          const page = template.pages[index];
          const initialized = !!this.pages[index];
          if (!initialized) this.pages[index] = createInstance(Canvas, this);
          this.pages[index].template.set(page);
          if (initialized) this.pages[index].template.load();
        }
        if (this.pages.length <= template.pages.length) return;
        for (let index = template.pages.length; index < this.pages.length; index++) this.pages[index].destroy();
        this.pages.splice(template.pages.length);
        break;
      case "replace":
        for (let index = 0; index < template.pages.length; index++) {
          const offset = index + this.page;
          const page = template.pages[index];
          const initialized = !!this.pages[offset];
          if (!initialized) this.pages[offset] = createInstance(Canvas, this);
          this.pages[offset].template.set(page);
          if (initialized) this.pages[offset].template.load();
        }
        break;
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

  addPage() {
    this.pages.push(createInstance(Canvas, this));
  }

  deleteActivePage() {
    const length = this.pages.length;
    if (length > 1) {
      this.pages[this.page].destroy();
      this.pages.splice(this.page, 1);
      if (this.page >= length - 1) this.page = this.page - 1;
    }
  }

  onChangeActivePage(index: number) {
    this.page = index;
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
        this.timelineOpen = false;
        break;
      case "open":
        this.timelineOpen = true;
        break;
      default:
        this.timelineOpen = !this.timelineOpen;
        break;
    }
  }
}
