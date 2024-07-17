import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { makeAutoObservable, runInAction } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { EditorAudioElement } from "@/types/editor";

export class CanvasAudio {
  private _canvas: Canvas;
  private context: AudioContext;
  elements: EditorAudioElement[];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this.elements = [];
    this.context = createInstance(AudioContext);

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private get selection() {
    return this._canvas.selection;
  }

  private get timeline() {
    return this._canvas.timeline;
  }

  private _timelineStartEvent() {
    this.play();
  }

  private _timelineStopEvent() {
    this.stop();
  }

  private _initEvents() {
    this.canvas.on("timeline:start", this._timelineStartEvent.bind(this));
    this.canvas.on("timeline:stop", this._timelineStopEvent.bind(this));
  }

  play() {
    for (const audio of this.elements) {
      if (audio.muted) continue;

      const gain = this.context.createGain();
      const source = this.context.createBufferSource();

      source.buffer = audio.buffer;
      gain.gain.value = audio.volume;

      gain.connect(this.context.destination);
      source.connect(gain);

      audio.playing = true;
      audio.source = source;

      audio.source.start(this.context.currentTime + audio.offset, audio.trim, audio.timeline);
      audio.source.addEventListener("ended", () => (audio.playing = false));
    }
  }

  record(audios: EditorAudioElement[], context: OfflineAudioContext) {
    for (const audio of audios) {
      if (audio.muted) continue;

      const gain = context.createGain();
      const source = context.createBufferSource();

      source.buffer = audio.buffer;
      gain.gain.value = audio.volume;
      audio.source = source;

      gain.connect(context.destination);
      source.connect(gain);
      source.start(context.currentTime + audio.offset, audio.trim, audio.timeline);
    }
  }

  stop(audios = this.elements) {
    for (const audio of audios) {
      if (!audio.playing) continue;
      audio.playing = false;
      audio.source.stop();
    }
  }

  delete(id: string) {
    const index = this.elements.findIndex((audio) => audio.id === id);
    if (index === -1) return;

    const audio = this.elements[index];
    this.elements.splice(index, 1);

    runInAction(() => {
      if (this.selection.active?.id === audio.id) this.selection.active = null;
      if (this._canvas.trim?.selected.id === audio.id) this._canvas.trim = null;
    });
  }

  update(id: string, value: Partial<EditorAudioElement>) {
    const index = this.elements.findIndex((audio) => audio.id === id);
    const audio = this.elements[index];

    const updated = { ...audio, ...value };
    this.elements[index] = updated;

    runInAction(() => {
      if (this.selection) this.selection.active = Object.assign({ type: "audio" }, updated) as unknown as fabric.Object;
    });
  }

  *add(url: string, name: string) {
    const response: Response = yield fetch(url);
    const data: ArrayBuffer = yield response.arrayBuffer();
    const buffer: AudioBuffer = yield this.context.decodeAudioData(data);

    const id = FabricUtils.elementID("audio");
    const duration = buffer.duration;
    const timeline = Math.min(duration, this.timeline.duration / 1000);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);

    const audio: EditorAudioElement = { id, buffer, url, timeline, name, duration, source, muted: false, playing: false, trim: 0, offset: 0, volume: 1 };
    this.elements.push(audio);

    return audio;
  }

  *extract(videos: fabric.Video[], { ffmpeg, signal }: { ffmpeg: FFmpeg; signal?: AbortSignal }) {
    if (!ffmpeg.loaded) throw createInstance(Error, "FFmpeg is not loaded");
    const result: EditorAudioElement[] = [];

    for (const video of videos) {
      if (!FabricUtils.isVideoElement(video) || !video.hasAudio) continue;
      signal?.throwIfAborted();

      const input = video.name!;
      const output = video.name! + ".wav";

      const file: Uint8Array = yield fetchFile(video.getSrc());
      yield ffmpeg.writeFile(input, file);
      yield ffmpeg.exec(["-i", input, "-q:a", "0", "-map", "a", output], undefined, { signal });

      const data: Uint8Array = yield ffmpeg.readFile(output);
      const buffer: AudioBuffer = yield this.context.decodeAudioData(data.buffer);

      const id = FabricUtils.elementID("audio");
      const duration = buffer.duration;

      const muted = video.muted();
      const volume = video.volume();

      const trim = video.trimStart / 1000;
      const offset = video.meta!.offset / 1000;
      const timeline = video.meta!.duration / 1000 - video.trimStart / 1000 - video.trimEnd / 1000;

      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      result.push({ id, buffer, duration, muted, volume, source, offset, timeline, trim, name: output, playing: false, url: "" });
    }

    return result;
  }
}
