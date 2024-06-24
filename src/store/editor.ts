import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";
import { createInstance } from "@/lib/utils";

export class Editor {
  page: number;
  pages: Canvas[];

  sidebar: string | null;
  isTimelineOpen: boolean;

  constructor() {
    const canvas = createInstance(Canvas);

    this.page = 0;
    this.pages = [canvas];

    this.sidebar = null;
    this.isTimelineOpen = false;

    makeAutoObservable(this);
  }

  get canvas() {
    return this.pages[this.page];
  }

  onToggleTimeline(mode?: "open" | "close") {
    if (mode === "open") this.isTimelineOpen = true;
    else if (mode === "close") this.isTimelineOpen = false;
    else this.isTimelineOpen = !this.isTimelineOpen;
  }

  onChangeActiveSidebar(sidebar: string | null) {
    this.sidebar = sidebar;
  }

  onAddPage() {
    const canvas = createInstance(Canvas);
    this.pages.push(canvas);
  }
}
