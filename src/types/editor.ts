export type EditorReplace = EditorReplaceVideo | EditorReplaceImage | EditorReplaceAudio | null;

export type EditorPlaceholder = "main-image" | "brand-image" | "cta-text" | "headline-text" | "description-text";

export interface EditorTemplate {
  id: string;
  name: string;
  is_pubished: boolean;
  pages: EditorTemplatePage[];
}

export interface EditorTemplatePage {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  data: EditorTemplatePageData;
}

export interface EditorTemplatePageData {
  scene: string;
  audios: Omit<EditorAudioElement, "buffer" | "source">[];
  fill: string;
  width: number;
  height: number;
}

export interface EditorMedia {
  source: string;
  thumbnail: string;
}

export interface EditorAudio {
  source: string;
  name: string;
  thumbnail: string;
  duration: number;
}

export interface EditorAudioElement {
  id: string;
  url: string;
  name: string;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  volume: number;
  muted: boolean;
  duration: number;
  offset: number;
  playing: boolean;
  trim: number;
  timeline: number;
}

export interface EditorTrimVideo {
  object: fabric.Video;
  type: "video";
}

export interface EditorTrimAudio {
  object: EditorAudioElement;
  type: "audio";
}

export type EditorTrim = EditorTrimAudio | EditorTrimVideo | null;

export interface EditorReplaceVideo {
  object: fabric.Video;
  type: "video";
}

export interface EditorReplaceImage {
  object: fabric.Image;
  type: "image";
}

export interface EditorReplaceAudio {
  object: EditorAudioElement;
  type: "audio";
}
