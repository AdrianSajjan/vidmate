import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";
import { createInstance } from "@/lib/utils";

export class Editor {
  page: number;
  pages: Canvas[];

  sidebarLeft: string | null;
  sidebarRight: string | null;
  isTimelineOpen: boolean;

  constructor() {
    const canvas = createInstance(Canvas);
    this.isTimelineOpen = false;

    this.page = 0;
    this.pages = [canvas];

    this.sidebarLeft = null;
    this.sidebarRight = null;

    makeAutoObservable(this);
  }

  get canvas() {
    return this.pages[this.page];
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
    const canvas = createInstance(Canvas);
    this.pages.push(canvas);
  }
}
