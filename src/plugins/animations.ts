import anime from "animejs";

import { AnimationTimeline } from "canvas";
import { makeAutoObservable } from "mobx";

import { Canvas } from "@/store/canvas";
import { FabricUtils } from "@/fabric/utils";
import { modifyAnimationEasing } from "@/lib/animations";

type AnimationState = ReturnType<CanvasAnimations["_save"]>;
export class CanvasAnimations {
  private _canvas: Canvas;

  private _active: fabric.Object | null;
  private _preview: anime.AnimeTimelineInstance | null;

  private _zoomAmount = 0.25;
  private _animationExitOffset = 50;
  private _animationEntryOffset = 50;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._preview = null;
    this._active = null;
    makeAutoObservable(this);
  }

  get timeline() {
    return this._canvas.timeline;
  }

  get canvas() {
    return this._canvas.instance;
  }

  private _save(object: fabric.Object) {
    const left = object.left!;
    const top = object.top!;
    const height = object.height!;
    const width = object.width!;

    const opacity = object.opacity!;
    const fill = object.fill!;
    const stroke = object.stroke!;

    const scaleX = object.scaleX!;
    const scaleY = object.scaleY!;
    const angle = object.angle!;

    if (!object.anim) FabricUtils.initializeAnimationProperties(object);
    object.anim!.state = { opacity, left, top, scaleX, scaleY, fill, stroke, angle, selectable: object.selectable, evented: object.evented };
    object.set({ selectable: false, evented: false });

    return { left, top, height, width, opacity, fill, stroke, scaleX, scaleY, angle };
  }

  private _entry(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], state: AnimationState, preview?: boolean) {
    const { left, top, height, width, opacity, scaleX, scaleY } = state;
    const offset = preview ? 0 : object.meta!.offset + this._animationEntryOffset;

    switch (entry.name) {
      case "fade-in": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "slide-in-left": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            left: [left - Math.min((width * scaleX) / 2, Number.MAX_VALUE), left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "slide-in-right": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            left: [left + Math.min((width * scaleX) / 2, Number.MAX_VALUE), left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "pan-in-left": {
        timeline.add(
          {
            targets: object,
            left: [left - Math.min((width * scaleX) / 2, Number.MAX_VALUE), left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "pan-in-right": {
        timeline.add(
          {
            targets: object,
            left: [left + Math.min((width * scaleX) / 2, Number.MAX_VALUE), left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "rise-in-up": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            top: [top + Math.min((height * scaleY) / 2, 50), top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "rise-in-down": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            top: [top - Math.min((height * scaleY) / 2, 50), top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "pop-in": {
        timeline.add(
          {
            targets: object,
            scaleY: [1 / height, scaleY],
            top: [top + (height * scaleY) / 2, top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }
    }
  }

  private _exit(object: fabric.Object, timeline: anime.AnimeTimelineInstance, exit: AnimationTimeline["in"], state: AnimationState, preview?: boolean) {
    const { left, top, height, width, scaleX, scaleY } = state;
    const offset = preview ? 0 : object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset;

    switch (exit.name) {
      case "fade-out": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "slide-out-left": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            left: [left, left - Math.min((width * scaleX) / 2, Number.MAX_VALUE)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "slide-out-right": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            left: [left, left + Math.min((width * scaleX) / 2, Number.MAX_VALUE)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "rise-out-up": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            top: [top, top - Math.min((height * scaleY) / 2, 50)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "sink-out-down": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            top: [top, top + Math.min((height * scaleY) / 2, 50)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "pop-out": {
        timeline.add(
          {
            targets: object,
            scaleY: [scaleY, 1 / height],
            top: [top, top + (height * scaleY) / 2],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }
    }
  }

  private _scene(
    object: fabric.Object,
    timeline: anime.AnimeTimelineInstance,
    entry: AnimationTimeline["in"],
    exit: AnimationTimeline["out"],
    scene: AnimationTimeline["scene"],
    state: AnimationState,
    preview?: boolean,
    mask?: boolean,
  ) {
    const { scaleX, scaleY } = state;

    const animation = scene.duration || 1000;
    const duration = preview ? animation : object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset) - (exit.name === "none" ? 0 : exit.duration + this._animationExitOffset);
    const offset = preview ? 0 : object.meta!.offset + (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset);

    switch (scene.name) {
      case "rotate": {
        timeline.add(
          {
            targets: { angle: object.angle! },
            angle: object.angle! + 360 * Math.round(duration / animation),
            duration: duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
            update: (anim) => {
              const centerPoint = object.getCenterPoint();
              const constraint = object.translateToOriginPoint(centerPoint, "center", "center");
              object.angle = +anim.animations[0].currentValue;
              object.setPositionByOrigin(constraint, "center", "center");
            },
          },
          offset,
        );
        break;
      }

      case "zoom-in": {
        if (mask) return;
        timeline.add(
          {
            targets: { scaleX: object.scaleX, scaleY: object.scaleY },
            scaleX: scaleX + this._zoomAmount,
            scaleY: scaleY + this._zoomAmount,
            duration: duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
            update: (anim) => {
              const centerPoint = object.getCenterPoint();
              const constraint = object.translateToOriginPoint(centerPoint, "center", "center");
              object.scaleX = +anim.animations[0].currentValue;
              object.scaleY = +anim.animations[1].currentValue;
              object.setPositionByOrigin(constraint, "center", "center");
            },
          },
          offset,
        );
        break;
      }

      case "zoom-out": {
        if (mask) return;
        timeline.add(
          {
            targets: { scaleX: object.scaleX, scaleY: object.scaleY },
            scaleX: scaleX - this._zoomAmount,
            scaleY: scaleY - this._zoomAmount,
            duration: duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
            update: (anim) => {
              const centerPoint = object.getCenterPoint();
              const constraint = object.translateToOriginPoint(centerPoint, "center", "center");
              object.scaleX = +anim.animations[0].currentValue;
              object.scaleY = +anim.animations[1].currentValue;
              object.setPositionByOrigin(constraint, "center", "center");
            },
          },
          offset,
        );
        break;
      }

      case "blink": {
        Array.from({ length: Math.ceil(duration / animation) * 2 }, (_, index) => {
          timeline.add(
            {
              targets: object,
              duration: animation / 2,
              opacity: index % 2,
              easing: modifyAnimationEasing(exit.easing, exit.duration),
            },
            offset + (animation / 2) * index,
          );
        });
        break;
      }
    }
  }

  private _initialize(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], scene: AnimationTimeline["scene"], mask?: boolean) {
    const state = this._save(object);
    this._entry(object, timeline, entry, state);
    this._exit(object, timeline, exit, state);
    this._scene(object, timeline, entry, exit, scene, state, false, mask);
  }

  preview(object: fabric.Object, type: "in" | "out" | "scene", animation: AnimationTimeline) {
    const state = this._save(object);
    this._preview = anime.timeline({ duration: animation[type].duration || 1000, change: this.canvas.requestRenderAll.bind(this.canvas), loop: true });
    switch (type) {
      case "in":
        this._entry(object, this._preview, animation["in"], state, true);
        break;
      case "out":
        this._exit(object, this._preview, animation["out"], state, true);
        break;
      case "scene":
        this._scene(object, this._preview, animation["in"], animation["out"], animation["scene"], state, true);
        if (object.clipPath) {
          const state = this._save(object.clipPath);
          this._scene(object.clipPath, this._preview, animation["in"], animation["out"], animation["scene"], state, true, true);
        }
        break;
    }
    this._preview.play();
  }

  stop(object = this._active) {
    this._preview?.pause();
    anime.remove(this._preview);
    this._preview = null;
    object?.set({ ...(object?.anim?.state || {}) });
    object?.clipPath?.set({ ...(object?.clipPath.anim?.state || {}) });
  }

  initialize(canvas: fabric.Canvas | fabric.StaticCanvas, timeline: anime.AnimeTimelineInstance, duration: number) {
    timeline.add({ targets: canvas, duration: duration });
    for (const object of canvas._objects) {
      if (object.excludeFromTimeline) continue;
      this._initialize(object, timeline, object.anim!.in, object.anim!.out, object.anim!.scene);
      if (object.clipPath) {
        this._initialize(object.clipPath, timeline, object.anim!.in, object.anim!.out, object.anim!.scene, true);
      }
    }
  }
}
