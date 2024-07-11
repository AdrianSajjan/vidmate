import { createInstance } from "@/lib/utils";
import { makeAutoObservable } from "mobx";

export interface BackgroundRemoverCache {
  original: string;
  modified: string;
}

export class BackgroundRemover {
  private model = "briaai/RMBG-1.4";

  initialized: boolean;
  cache: Map<string, BackgroundRemoverCache>;
  status: "idle" | "pending" | "completed" | "rejected";

  constructor() {
    this.status = "idle";
    this.initialized = false;
    this.cache = createInstance(Map<string, BackgroundRemoverCache>);
    makeAutoObservable(this);
  }

  *onInitialize() {
    console.log(this.model); // Load Model
    this.initialized = true;
  }

  *removeBackground(url: string) {
    console.log(url); // Remove Background of image
  }
}
