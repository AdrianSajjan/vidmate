import { makeAutoObservable } from "mobx";
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
  status: "uninitialized" | "pending" | "complete" | "error";

  constructor() {
    this.ffmpeg = createInstance(FFmpeg);
    this.pages = [createInstance(Canvas)];

    this.page = 0;
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
      this.ffmpeg.on("log", console.log);
      this.status = "complete";
    } catch (error) {
      console.log(error);
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
}
