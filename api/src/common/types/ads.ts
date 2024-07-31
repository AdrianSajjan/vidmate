export interface Video {
  name: string;
  url: string;
  meta: {
    tags: string[];
    audios: Audio[];
  };
}

export interface Audio {
  name: string;
  url: string;
}

export interface Speech {
  url: string;
  voice: string;
  gender: string;
  subtitle: string;
}

export interface Scene {
  video?: Video;
  audio?: Audio;
  speech?: Speech;
  duration: number;
}
