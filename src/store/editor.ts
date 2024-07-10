import { makeAutoObservable, runInAction } from "mobx";
import { Canvas } from "@/store/canvas";
import { createInstance } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const FFMPEG_BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

export class Editor {
  page: number;
  pages: Canvas[];

  sidebarLeft: string | null;
  sidebarRight: string | null;
  isTimelineOpen: boolean;

  ffmpeg: FFmpeg;
  exporting: boolean;
  status: "uninitialized" | "pending" | "complete" | "error";

  constructor() {
    this.ffmpeg = createInstance(FFmpeg);
    this.pages = [createInstance(Canvas)];

    this.page = 0;
    this.exporting = false;
    this.status = "uninitialized";

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
        coreURL: yield toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: yield toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      this.status = "complete";
    } catch (error) {
      this.status = "error";
    }
  }

  setActiveSidebarLeft(sidebar: string | null) {
    this.sidebarLeft = sidebar;
  }

  setActiveSidebarRight(sidebar: string | null) {
    this.sidebarRight = sidebar;
  }

  onToggleTimeline(mode?: "open" | "close") {
    if (mode === "open") this.isTimelineOpen = true;
    else if (mode === "close") this.isTimelineOpen = false;
    else this.isTimelineOpen = !this.isTimelineOpen;
  }

  onAddPage() {
    this.pages.push(createInstance(Canvas));
  }

  *onExportVideo(_: "webmp" | "mp4") {
    if (!this.canvas.instance) throw createInstance(Error, "Canvas instance not initialized");

    this.exporting = true;

    const canvas = this.canvas.instance.getElement();
    const video = document.createElement("video");

    this.canvas.onRecordVideo();
    const videoStream = canvas.captureStream(30);

    const audioStream = this.canvas.audioContext.createMediaStreamDestination();
    this.canvas.onRecordAudio(audioStream);

    const videoTracks = videoStream.getTracks();
    const audioTracks = audioStream.stream.getTracks();

    const chunks: Blob[] = [];
    const stream = createInstance(MediaStream, [...videoTracks, ...audioTracks]);

    video.width = this.canvas.width;
    video.height = this.canvas.height;
    video.srcObject = stream;

    yield video.play();
    const mediaRecorder = createInstance(MediaRecorder, stream);

    return createInstance(Promise<Blob>, (resolve, reject) => {
      mediaRecorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
      });
      mediaRecorder.addEventListener("error", () => {
        runInAction(() => (this.exporting = false));
        reject("Media recorder ran into an error");
      });
      mediaRecorder.addEventListener("stop", () => {
        video.remove();
        runInAction(() => (this.exporting = false));
        const blob = createInstance(Blob, chunks, { type: "video/webm" });
        resolve(blob);
      });
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), this.canvas.duration);
    });
  }
}
