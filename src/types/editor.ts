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
  selected: fabric.Video;
  type: "video";
}

export interface EditorTrimAudio {
  selected: EditorAudioElement;
  type: "audio";
}

export type EditorTrim = EditorTrimAudio | EditorTrimVideo | null;
