import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";
import { createInstance } from "@/lib/utils";

export class Editor {
  page: number;
  sidebar: string | null;
  pages: Canvas[];

  constructor() {
    const canvas = createInstance(Canvas);

    this.page = 0;
    this.sidebar = null;
    this.pages = [canvas];

    makeAutoObservable(this);
  }

  get canvas() {
    return this.pages[this.page];
  }

  onChangeActiveSidebar(sidebar: string | null) {
    this.sidebar = sidebar;
  }

  onAddPage() {
    const canvas = createInstance(Canvas);
    this.pages.push(canvas);
  }
}
