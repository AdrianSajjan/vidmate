import anime from "animejs";
import { AnimationTimeline } from "canvas";
import { FabricUtils } from "@/fabric/utils";
import { modifyAnimationEasing } from "@/lib/animations";
import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";

export class CanvasAnimations {
  private _canvas: Canvas;

  private _zoomAmount = 0.25;

  private _animationExitOffset = 50;
  private _animationEntryOffset = 50;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  get timeline() {
    return this._canvas.timeline;
  }

  private _initialize(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], scene: AnimationTimeline["scene"], mask?: boolean) {
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

    switch (entry.name) {
      case "fade-in": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
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
          object.meta!.offset + this._animationEntryOffset,
        );
        break;
      }
      case "pop-in": {
        timeline.add(
          {
            targets: object,
            scaleY: [0.01, scaleY],
            top: [top + (height * scaleY) / 2, top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          object.meta!.offset + this._animationEntryOffset,
        );
        break;
      }
    }

    switch (exit.name) {
      case "fade-out": {
        timeline.add(
          {
            targets: object,
            opacity: 0,
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
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
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
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
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
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
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
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
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
        );
        break;
      }
      case "pop-out": {
        timeline.add(
          {
            targets: object,
            scaleY: [scaleY, 0.01],
            top: [top, top + (height * scaleY) / 2],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
        );
        break;
      }
    }

    switch (scene.name) {
      case "rotate": {
        const duration = object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset) - (exit.name === "none" ? 0 : exit.duration + this._animationExitOffset);
        const offset = object.meta!.offset + (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset);
        const spin = scene.duration || 500;
        timeline.add(
          {
            targets: { angle: object.angle! },
            angle: object.angle! + 360 * Math.round(duration / spin),
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
        const duration = object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset) - (exit.name === "none" ? 0 : exit.duration + this._animationExitOffset);
        const offset = object.meta!.offset + (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset);
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
        const duration = object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset) - (exit.name === "none" ? 0 : exit.duration + this._animationExitOffset);
        const offset = object.meta!.offset + (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset);
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
    }
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
