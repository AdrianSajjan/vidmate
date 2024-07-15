import anime from "animejs";
import { makeAutoObservable } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { Canvas } from "@/store/canvas";
import { CanvasAnimations } from "@/plugins/animations";

export class CanvasTimeline {
  private _canvas: Canvas;
  private _timeline: anime.AnimeTimelineInstance | null;

  seek: number;
  playing: boolean;
  duration: number;

  constructor(canvas: Canvas) {
    this.seek = 0;
    this.duration = 5000;
    this.playing = false;

    this._timeline = null;
    this._canvas = canvas;

    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _initEvents() {
    this.canvas.on("object:added", this._objectAddedEvent.bind(this));
  }

  private _objectAddedEvent(event: fabric.IEvent<MouseEvent>) {
    if (!event.target || FabricUtils.isElementExcluded(event.target)) return;
    this._toggleElement(event.target, this.seek);
  }

  private _toggleElements(ms: number) {
    for (const object of this.canvas._objects) {
      if (FabricUtils.isElementExcluded(object)) continue;
      this._toggleElement(object, ms);
    }
    this.canvas.requestRenderAll();
  }

  private _toggleElement(object: fabric.Object, ms: number) {
    const hidden = object.meta!.offset > ms || object.meta!.offset + object.meta!.duration < ms;
    object.visible = !hidden;
    if (FabricUtils.isVideoElement(object)) {
      if (this.playing) {
        if (hidden) object.pause();
        else object.play();
      } else {
        object.seek((ms - object.meta!.offset) / 1000);
      }
    }
  }

  private _begin(anim: anime.AnimeInstance) {
    this.seek = anim.currentTime;
    this._toggleElements(this.seek);
  }

  private _update(anim: anime.AnimeInstance) {
    if (anim.currentTime < this.duration) {
      this.seek = anim.currentTime;
      this._toggleElements(this.seek);
    } else {
      this.pause();
    }
  }

  private _complete(_: anime.AnimeInstance) {
    this.seek = 0;
    this.playing = false;
    this._resetTimeline();
    this.canvas.fire("timeline:stop");
  }

  private _initializeTimeline() {
    this._timeline = anime.timeline({ duration: this.duration, autoplay: false, begin: this._begin, update: this._update, complete: this._complete });
    CanvasAnimations.initializeAnimations(this.canvas, this._timeline!, this.duration);
  }

  private _resetTimeline() {
    if (this._timeline) {
      anime.remove(this._timeline);
      this._timeline = null;
    }
    for (const object of this.canvas._objects) {
      if (FabricUtils.isElementExcluded(object)) continue;
      object.set({ ...(object.anim?.state || {}) });
    }
    this._toggleElements(this.seek);
  }

  play() {
    this._initializeTimeline();
    this.canvas.fire("timeline:start");

    this.playing = true;
    this._timeline!.seek(this.seek);
    this._timeline!.play();
  }

  pause() {
    this.playing = false;
    this.canvas.fire("timeline:stop");

    this._timeline!.pause();
    this._resetTimeline();
  }

  set(property: "duration" | "seek", seconds: number) {
    this[property] = seconds * 1000;
  }
}
