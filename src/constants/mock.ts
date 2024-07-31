import { createInstance } from "@/lib/utils";
import { EditorAudio, EditorMedia, EditorTemplate } from "@/types/editor";
import { useSyncExternalStore } from "react";

const images: EditorMedia[] = [
  {
    source: "https://images.unsplash.com/photo-1558383331-f520f2888351?q=100&w=1080&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1558383331-f520f2888351?q=75&w=256&auto=format",
  },
  {
    source: "https://plus.unsplash.com/premium_photo-1710119487743-48959c984d45?q=100&w=1080&auto=format",
    thumbnail: "https://plus.unsplash.com/premium_photo-1710119487743-48959c984d45?q=75&w=256&auto=format",
  },
  {
    source: "https://images.unsplash.com/photo-1709704878349-6489691c0bd6?q=100&w=1080&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1709704878349-6489691c0bd6?q=75&w=256&auto=format",
  },
];

const videos: EditorMedia[] = [
  {
    source: "https://cdn.img.ly/assets/demo/v2/ly.img.video/videos/pexels-drone-footage-of-a-surfer-barrelling-a-wave-12715991.mp4",
    thumbnail: "https://cdn.img.ly/assets/demo/v2/ly.img.video/thumbnails/pexels-drone-footage-of-a-surfer-barrelling-a-wave-12715991.jpg",
  },
];

const audios: EditorAudio[] = [];

const templates: EditorTemplate[] = [];

export interface MockDataState {
  images: EditorMedia[];
  videos: EditorMedia[];
  audios: EditorAudio[];
  templates: EditorTemplate[];
}

export class MockDataStore {
  state: MockDataState;
  subscribers: Set<Function>;

  constructor() {
    this.state = { images, videos, audios, templates };
    this.subscribers = createInstance(Set<Function>);
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
