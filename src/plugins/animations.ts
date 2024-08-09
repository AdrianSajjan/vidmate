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

  previewing: boolean;

  constructor(canvas: Canvas) {
    this._active = null;
    this._preview = null;
    this.previewing = false;

    this._canvas = canvas;
    makeAutoObservable(this);
  }

  get timeline() {
    return this._canvas.timeline;
  }

  get canvas() {
    return this._canvas.instance;
  }

  get text() {
    return this._canvas.text;
  }

  private _update() {
    this.canvas.renderAll();
  }

  private _complete(object: fabric.Object) {
    setTimeout(() => this.dispose(object), 500);
  }

  private _save(object: fabric.Object) {
    const left = object.left!;
    const top = object.top!;
    const height = object.height!;
    const width = object.width!;

    const fill = object.fill!;
    const stroke = object.stroke!;
    const opacity = object.opacity!;

    const scaleX = object.scaleX!;
    const scaleY = object.scaleY!;
    const angle = object.angle!;

    const state = { opacity, left, top, scaleX, scaleY, fill, stroke, angle };
    const events = { selectable: object.selectable, evented: object.evented };
    const controls = { hasControls: object.hasControls, hasBorders: object.hasBorders };
    const locks = { lockMovementX: object.lockMovementX, lockMovementY: object.lockMovementY, lockScalingX: object.lockScalingX, lockScalingY: object.lockScalingY, lockRotation: object.lockRotation };

    if (!object.anim) FabricUtils.initializeAnimationProperties(object);
    object.anim!.state = Object.assign(state, events, locks, controls);
    object.set({ lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true, hasBorders: false, hasControls: false, selectable: false, evented: false });

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
            left: [left - Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER), left],
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
            left: [left + Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER), left],
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
            left: [left - Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER), left],
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
            left: [left + Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER), left],
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
            top: [top + Math.min((height * scaleY) / 2, Number.MAX_SAFE_INTEGER), top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "sink-in-down": {
        timeline.add(
          {
            targets: object,
            opacity: [0, opacity],
            top: [top - Math.min((height * scaleY) / 2, Number.MAX_SAFE_INTEGER), top],
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

      case "typewriter": {
        if (!FabricUtils.isAnimatedTextElement(object)) return;
        const letters = object._objects.map((word) => (FabricUtils.isGroupElement(word) ? word._objects : [])).flat();
        letters.map((letter, index) => {
          const state = { opacity: 0 };
          letter.set(Object.assign({}, state));
          timeline.add(
            {
              targets: state,
              opacity: 1,
              duration: entry.duration / letters.length,
              easing: modifyAnimationEasing(entry.easing, entry.duration),
              update: () => letter.set({ opacity: state.opacity }),
            },
            offset + (entry.duration / letters.length) * index,
          );
        });
        break;
      }

      case "burst": {
        if (!FabricUtils.isAnimatedTextElement(object)) return;
        const letters = object._objects.map((word) => (FabricUtils.isGroupElement(word) ? word._objects : [])).flat();
        letters.map((letter, index) => {
          const target = { scaleY: letter.scaleY, scaleX: letter.scaleX, top: letter.top!, left: letter.left! };
          const state = { scaleY: 1 / letter.height!, scaleX: 1 / letter.width!, top: letter.top! + (letter.height! * letter.scaleY!) / 2, left: letter.left! + (letter.width! * letter.scaleX!) / 2 };
          letter.set(Object.assign({}, state));
          timeline.add(
            {
              targets: state,
              top: target.top,
              left: target.left,
              scaleX: target.scaleX,
              scaleY: target.scaleY,
              duration: entry.duration / letters.length,
              easing: modifyAnimationEasing(entry.easing, entry.duration),
              update: () => letter.set({ scaleX: state.scaleX, scaleY: state.scaleY, top: state.top, left: state.left }),
            },
            offset + (entry.duration / letters.length) * index,
          );
        });
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
            left: [left, left - Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER)],
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
            left: [left, left + Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER)],
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
            top: [top, top - Math.min((height * scaleY) / 2, Number.MAX_SAFE_INTEGER)],
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
            top: [top, top + Math.min((height * scaleY) / 2, Number.MAX_SAFE_INTEGER)],
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

  private _scene(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], scene: AnimationTimeline["scene"], state: AnimationState, preview?: boolean, mask?: boolean) {
    const { scaleX, scaleY } = state;

    const animation = scene.duration || 1000;
    const duration = preview ? 5000 : object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._animationEntryOffset) - (exit.name === "none" ? 0 : exit.duration + this._animationExitOffset);
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
    if (animation[type].name === "none") return;

    this._canvas.onToggleControls(false);
    const element = FabricUtils.isTextboxElement(object) ? this.text.animate(object, this.canvas) : object;
    const state = this._save(element);

    this._active = object;
    this.previewing = true;
    this._preview = anime.timeline({ update: this._update.bind(this), complete: this._complete.bind(this, element), endDelay: 2000, loop: true });

    switch (type) {
      case "in":
        this._entry(element, this._preview, animation["in"], state, true);
        break;
      case "out":
        this._exit(element, this._preview, animation["out"], state, true);
        break;
      case "scene":
        this._scene(element, this._preview, animation["in"], animation["out"], animation["scene"], state, true);
        if (element.clipPath) this._scene(element.clipPath, this._preview, animation["in"], animation["out"], animation["scene"], this._save(element.clipPath), true, true);
        break;
    }

    this._preview.play();
    element.on("deselected", this.dispose.bind(this, element));
  }

  initialize(canvas: fabric.Canvas | fabric.StaticCanvas, timeline: anime.AnimeTimelineInstance, duration: number) {
    timeline.add({ targets: canvas, duration: duration });
    for (const object of canvas._objects) {
      if (object.excludeFromTimeline) continue;
      if (FabricUtils.isTextboxElement(object)) {
        const textbox = this.text.animate(object, canvas);
        this._initialize(textbox, timeline, textbox.anim!.in, textbox.anim!.out, textbox.anim!.scene);
      } else {
        this._initialize(object, timeline, object.anim!.in, object.anim!.out, object.anim!.scene);
        if (object.clipPath) this._initialize(object.clipPath, timeline, object.anim!.in, object.anim!.out, object.anim!.scene, true);
      }
    }
  }

  dispose(object = this._active) {
    this._preview?.pause();
    anime.remove(this._preview);

    this._active = null;
    this._preview = null;
    this.previewing = false;

    if (FabricUtils.isTextboxElement(object) || FabricUtils.isAnimatedTextElement(object)) {
      this.text.restore(object.name!);
    } else {
      object?.set({ ...(object?.anim?.state || {}) });
      object?.clipPath?.set({ ...(object?.clipPath.anim?.state || {}) });
      object?.off("deselected");
    }

    this._canvas.onToggleControls(true);
    this.canvas.renderAll();
  }
}
