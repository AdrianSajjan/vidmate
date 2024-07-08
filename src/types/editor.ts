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
  src: string;
  volume: string;
  duration: number;
  offset: number;
  trim: number;
  timeline: number;
}
