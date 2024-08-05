import { createInstance } from "@/lib/utils";
import { EditorAudio, EditorMedia, EditorTemplate } from "@/types/editor";
import { PromptSession } from "@/types/prompt";
import { useSyncExternalStore } from "react";

const images: EditorMedia[] = [];

const videos: EditorMedia[] = [];

const prompts: PromptSession[] = [];

const audios: EditorAudio[] = [];

const templates: EditorTemplate[] = [];

export interface MockDataState {
  images: EditorMedia[];
  videos: EditorMedia[];
  audios: EditorAudio[];
  prompts: PromptSession[];
  templates: EditorTemplate[];
}

export class MockDataStore {
  state: MockDataState;
  subscribers: Set<Function>;

  constructor() {
    this.subscribers = createInstance(Set<Function>);
    this.state = { images, videos, audios, templates, prompts };
  }

  store() {
    return this.state;
  }

  subscribe(callback: Function) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  upload(type: "audio", props: EditorAudio): void;
  upload(type: "template", props: EditorTemplate): void;
  upload(type: "image" | "video", props: EditorMedia): void;
  upload(type: "image" | "video" | "audio" | "template", props: EditorAudio | EditorMedia | EditorTemplate) {
    switch (type) {
      case "image":
        this.state.images.push(props as EditorMedia);
        break;
      case "video":
        this.state.videos.push(props as EditorMedia);
        break;
      case "audio":
        this.state.audios.push(props as EditorAudio);
        break;
      case "template": {
        const data = props as EditorTemplate;
        const index = this.state.templates.findIndex((template) => template.id === data.id);
        if (index === -1) this.state.templates.push(data);
        else this.state.templates[index] = data;
        break;
      }
    }
    this.subscribers.forEach((listener) => listener());
  }
}

export const mock = createInstance(MockDataStore);

export function useMockStore() {
  const store = useSyncExternalStore(mock.subscribe.bind(mock), mock.store.bind(mock));
  return store;
}
