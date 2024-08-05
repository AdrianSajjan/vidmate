import anime from "animejs";
import { AnimationTimeline } from "canvas";
import { FabricUtils } from "@/fabric/utils";
import { modifyAnimationEasing } from "@/lib/animations";

export abstract class CanvasAnimations {
  private static _animationExitOffset = 50;
  private static _animationEntryOffset = 50;

  private static _initializeAnimation(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], _: AnimationTimeline["scene"]) {
    const left = object.left!;
    const top = object.top!;

    const scaleX = object.scaleX!;
    const scaleY = object.scaleY!;

    const opacity = object.opacity!;
    const height = object.height!;
    const width = object.width!;

    if (!object.anim) FabricUtils.initializeAnimationProperties(object);
    object.anim!.state = { opacity, left, top, scaleX, scaleY, fill: object.fill, selectable: object.selectable, evented: object.evented };
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
            left: [left - Math.min((width * scaleX) / 2, 100), left],
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
            left: [left + Math.min((width * scaleX) / 2, 100), left],
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
            scaleY: [0, scaleY],
            top: [top + (width * scaleY) / 2, top],
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
            left: [left, left - Math.min((width * scaleX) / 2, 100)],
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
            left: [left, left + Math.min((width * scaleX) / 2, 100)],
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
            scaleY: [scaleY, 0],
            top: [top, top + (width * scaleY) / 2],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          object.meta!.offset + object.meta!.duration - exit.duration - this._animationExitOffset,
        );
        break;
      }
    }
  }

  static initializeAnimations(canvas: fabric.Canvas | fabric.StaticCanvas, timeline: anime.AnimeTimelineInstance, duration: number) {
    timeline.add({ targets: canvas, duration: duration });
    for (const object of canvas._objects) {
      if (object.excludeFromTimeline) continue;
      this._initializeAnimation(object, timeline, object.anim!.in, object.anim!.out, object.anim!.scene);
      if (object.clipPath) {
        this._initializeAnimation(object.clipPath, timeline, object.anim!.in, object.anim!.out, object.anim!.scene);
      }
    }
  }
}
