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
  source: string;
  name: string;
  arrayBuffer: ArrayBuffer;
  audioBuffer: AudioBuffer;
  volume: number;
  duration: number;
  offset: number;
  trim: number;
  timeline: number;
}
