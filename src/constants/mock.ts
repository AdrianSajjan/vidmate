import { createInstance } from "@/lib/utils";
import { EditorAudio, EditorMedia, EditorTemplate } from "@/types/editor";
import { PromptSession } from "@/types/prompt";
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

const prompts: PromptSession[] = [
  {
    id: "1",
    tags: ["running", "shoes"],
    prompt: "Running Shoes",
    scene: [
      {
        video: {
          name: "engineered-with-state-of-the-art-technology-for-unmatched-comfort-and-durability",
          url: "http://localhost:3000/videos/178420.mp4",
          meta: {
            tags: ["running", "shoes", "trail", "hill"],
            audios: [
              {
                name: "rock-beat-rythm",
                url: "http://localhost:3000/audios/178420.mp3",
              },
            ],
          },
        },
        speech: {
          gender: "male",
          url: "http://localhost:3000/speech/0977f62b-bd25-4ade-994e-42b3b59149dd.mp3",
          subtitle: "Introducing the ultimate performance boost - the new SprintX Sports Shoes!",
          voice: "Brian",
        },
        duration: 5,
      },
      {
        video: {
          name: "experience-the-perfect-grip-with-our-advanced-traction-soles-on-any-terrain",
          url: "http://localhost:3000/videos/178421.mp4",
          meta: {
            tags: ["running", "shoes", "trail", "hill"],
            audios: [
              {
                name: "rock-beat-rythm",
                url: "http://localhost:3000/audios/178420.mp3",
              },
            ],
          },
        },
        speech: {
          gender: "male",
          url: "http://localhost:3000/speech/a5d25311-ba14-4268-b746-5c1d345cad77.mp3",
          subtitle: "Engineered with state-of-the-art technology for unmatched comfort and durability.",
          voice: "Brian",
        },
        duration: 5,
      },
      {
        video: {
          name: "grab-yours-today-and-feel-the-difference-in-every-step-you-take",
          url: "http://localhost:3000/videos/178422.mp4",
          meta: {
            tags: ["running", "shoes", "trail", "hill"],
            audios: [
              {
                name: "rock-beat-rythm",
                url: "http://localhost:3000/audios/178420.mp3",
              },
            ],
          },
        },
        speech: {
          gender: "male",
          url: "http://localhost:3000/speech/ea6111e3-9b3a-42ac-8b0e-79729d9940f4.mp3",
          subtitle: "Experience the perfect grip with our advanced traction soles on any terrain.",
          voice: "Brian",
        },
        duration: 5,
      },
      {
        audio: {
          name: "rock-beat-rythm",
          url: "http://localhost:3000/audios/178420.mp3",
        },
        duration: 15,
      },
    ],
    duration: 15,
    format: "banner",
  },
];

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
