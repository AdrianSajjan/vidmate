import anime from "animejs";

import { fabric } from "fabric";
import { AnimationTimeline } from "canvas";
import { makeAutoObservable } from "mobx";

import { Canvas } from "@/store/canvas";
import { FabricUtils } from "@/fabric/utils";
import { modifyAnimationEasing } from "@/lib/animations";
import { random } from "lodash";
import { createInstance } from "@/lib/utils";

type AnimationState = ReturnType<CanvasAnimations["_save"]>;

export class CanvasAnimations {
  private _canvas: Canvas;

  private _extras: fabric.Object[];
  private _active: fabric.Object | null;
  private _preview: anime.AnimeTimelineInstance | null;

  private _zoom = 0.25;
  private _exitOffset = 50;
  private _entryOffset = 50;

  previewing: boolean;

  constructor(canvas: Canvas) {
    this._active = null;
    this._preview = null;

    this._extras = [];
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

  private _lettersOrWords(lines: fabric.Group, type: "letter" | "word") {
    return lines._objects
      .map((line) => {
        if (FabricUtils.isGroupElement(line)) {
          if (type === "word") {
            return line._objects;
          } else {
            return line._objects
              .map((word) => {
                if (FabricUtils.isGroupElement(word)) {
                  return word._objects;
                } else {
                  return [];
                }
              })
              .flat();
          }
        } else {
          return [];
        }
      })
      .flat();
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
    const clipPath = object.clipPath;

    const state = { opacity, left, top, scaleX, scaleY, fill, stroke, angle, clipPath };
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
    const offset = preview ? 0 : object.meta!.offset + this._entryOffset;

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

      case "wipe-in": {
        const clipPath = createInstance(fabric.Rect, { height, width, top, left: left - width * scaleX, absolutePositioned: true });
        object.set({ clipPath });
        timeline.add(
          {
            targets: clipPath,
            left: [left - width * scaleX, left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }
    }

    if (FabricUtils.isAnimatedTextElement(object)) {
      const lettersOrWords = this._lettersOrWords(object, entry.text || "letter");

      switch (entry.name) {
        case "typewriter": {
          lettersOrWords.map((letterOrWord, index) => {
            const state = { opacity: 0 };
            letterOrWord.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                opacity: 1,
                duration: entry.duration / lettersOrWords.length,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => letterOrWord.set({ opacity: state.opacity }),
              },
              offset + (entry.duration / lettersOrWords.length) * index,
            );
          });
          break;
        }

        case "burst": {
          lettersOrWords.map((letterOrWord, index) => {
            const target = { scaleY: letterOrWord.scaleY, scaleX: letterOrWord.scaleX, top: letterOrWord.top!, left: letterOrWord.left! };
            const state = {
              scaleY: 1 / letterOrWord.height!,
              scaleX: 1 / letterOrWord.width!,
              top: letterOrWord.top! + (letterOrWord.height! * letterOrWord.scaleY!) / 2,
              left: letterOrWord.left! + (letterOrWord.width! * letterOrWord.scaleX!) / 2,
            };
            letterOrWord.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                top: target.top,
                left: target.left,
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                duration: entry.duration / lettersOrWords.length,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => letterOrWord.set({ scaleX: state.scaleX, scaleY: state.scaleY, top: state.top, left: state.left }),
              },
              offset + (entry.duration / lettersOrWords.length) * index,
            );
          });
          break;
        }

        case "clarify": {
          lettersOrWords.map((letterOrWord) => {
            const target = { opacity: 1, blur: 0 };
            const state = { opacity: 0, blur: 10 };
            const seed = random(0, Math.min(500, entry.duration - 250));
            letterOrWord.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                opacity: target.opacity,
                blur: target.blur,
                duration: entry.duration - seed,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => letterOrWord.set({ opacity: state.opacity, blur: state.blur }),
              },
              offset + seed,
            );
          });
          timeline.add(
            {
              targets: object,
              left: [left - 15, left],
              duration: entry.duration,
              easing: modifyAnimationEasing(entry.easing, entry.duration),
            },
            offset,
          );
          break;
        }
      }
    }
  }

  private _exit(object: fabric.Object, timeline: anime.AnimeTimelineInstance, exit: AnimationTimeline["in"], state: AnimationState, preview?: boolean) {
    const { left, top, height, width, scaleX, scaleY } = state;
    const offset = preview ? 0 : object.meta!.offset + object.meta!.duration - exit.duration - this._exitOffset;

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
    const duration = preview ? 5000 : object.meta!.duration - (entry.name === "none" ? 0 : entry.duration + this._entryOffset) - (exit.name === "none" ? 0 : exit.duration + this._exitOffset);
    const offset = preview ? 0 : object.meta!.offset + (entry.name === "none" ? 0 : entry.duration + this._entryOffset);

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
            scaleX: scaleX + this._zoom,
            scaleY: scaleY + this._zoom,
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
            scaleX: scaleX - this._zoom,
            scaleY: scaleY - this._zoom,
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

    this.canvas.remove(...this._extras);
    this._canvas.onToggleControls(true);

    this._extras = [];
    this._active = null;
    this._preview = null;

    if (FabricUtils.isTextboxElement(object) || FabricUtils.isAnimatedTextElement(object)) {
      this.text.restore(object.name!);
    } else {
      object?.set({ ...(object?.anim?.state || {}) });
      object?.clipPath?.set({ ...(object?.clipPath?.anim?.state || {}) });
    }

    object?.off("deselected");
    this.previewing = false;
    this.canvas.renderAll();
  }
}
