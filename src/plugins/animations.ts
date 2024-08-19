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
  private _timeline: anime.AnimeTimelineInstance | null;

  private _zoom = 0.25;
  private _exitOffset = 50;
  private _entryOffset = 50;

  previewing: boolean;

  constructor(canvas: Canvas) {
    this._active = null;
    this._timeline = null;

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

  private _ungroupAnimatedText(lines: fabric.Group, type: fabric.TextAnimateOptions) {
    if (type === "line") {
      return lines._objects;
    } else {
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

    const state = { opacity, left, top, scaleX, scaleY, fill, stroke, angle, clipPath, height, width };
    const events = { selectable: object.selectable, evented: object.evented };
    const controls = { hasControls: object.hasControls, hasBorders: object.hasBorders };
    const locks = { lockMovementX: object.lockMovementX, lockMovementY: object.lockMovementY, lockScalingX: object.lockScalingX, lockScalingY: object.lockScalingY, lockRotation: object.lockRotation };

    if (!object.anim) FabricUtils.initializeAnimationProperties(object);
    object.anim!.state = Object.assign(state, events, locks, controls);
    object.set({ lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true, hasBorders: false, hasControls: false, selectable: false, evented: false });

    return { ...state };
  }

  private _entry(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], state: AnimationState, mask?: boolean, preview?: boolean) {
    if (!entry) return;

    const { left, top, height, width, opacity, angle, scaleX, scaleY } = state;
    const offset = preview ? 0 : object.meta!.offset + this._entryOffset;

    switch (entry.name) {
      case "fade": {
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

      case "slide-left": {
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

      case "slide-right": {
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

      case "pan-left": {
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

      case "pan-right": {
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

      case "rise-up": {
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

      case "sink-down": {
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

      case "merge": {
        if (mask) return;

        const props = { angle, height, width, top: top + height * scaleY, left: left + width * scaleX, absolutePositioned: true };

        if (!object.clipPath) {
          object.clipPath = createInstance(fabric.Rect, props);
          object.set({ clipPath: object.clipPath });
        }

        timeline.add(
          {
            targets: object.clipPath,
            left: [props.left, left],
            top: [props.top, top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "pop": {
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

      case "wipe": {
        if (mask) return;

        let clipPath = object.clipPath;
        const delta = FabricUtils.calculateAnimationPositionDelta(object);
        const props = { angle, height, width, top: top - delta.x * delta.width, left: left - delta.y * delta.width, absolutePositioned: true };

        if (!clipPath) {
          clipPath = createInstance(fabric.Rect, props);
          object.set({ clipPath });
        }

        timeline.add(
          {
            targets: clipPath,
            left: [props.left, left],
            top: [props.top, top],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }

      case "baseline": {
        if (mask) return;

        const delta = FabricUtils.calculateAnimationPositionDelta(object);
        if (!object.clipPath) object.clipPath = createInstance(fabric.Rect, { angle, height, width, top, left, absolutePositioned: true });

        timeline.add(
          {
            targets: object,
            top: [top + delta.y * delta.height, top],
            left: [left - delta.x * delta.height, left],
            duration: entry.duration,
            easing: modifyAnimationEasing(entry.easing, entry.duration),
          },
          offset,
        );
        break;
      }
    }

    if (FabricUtils.isAnimatedTextElement(object)) {
      const text = this._ungroupAnimatedText(object, entry.text || "letter");

      switch (entry.name) {
        case "typewriter": {
          text.map((element, index) => {
            const state = { opacity: 0 };
            element.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                opacity: 1,
                duration: entry.duration / text.length,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => element.set({ opacity: state.opacity }),
              },
              offset + (entry.duration / text.length) * index,
            );
          });
          break;
        }

        case "burst": {
          text.map((element, index) => {
            const target = { scaleY: element.scaleY, scaleX: element.scaleX, top: element.top!, left: element.left! };
            const state = {
              scaleY: 1 / element.height!,
              scaleX: 1 / element.width!,
              top: element.top! + (element.height! * element.scaleY!) / 2,
              left: element.left! + (element.width! * element.scaleX!) / 2,
            };
            element.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                top: target.top,
                left: target.left,
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                duration: entry.duration / text.length,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => element.set({ scaleX: state.scaleX, scaleY: state.scaleY, top: state.top, left: state.left }),
              },
              offset + (entry.duration / text.length) * index,
            );
          });
          break;
        }

        case "clarify": {
          text.map((element) => {
            const target = { opacity: 1, blur: 0 };
            const state = { opacity: 0, blur: 10 };
            const seed = random(0, Math.min(500, entry.duration - 250));
            element.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                opacity: target.opacity,
                blur: target.blur,
                duration: entry.duration - seed,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => element.set({ opacity: state.opacity, blur: state.blur }),
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

        case "bounce": {
          text.map((element, index) => {
            const target = { top: element.top!, opacity: 1 };
            const state = { top: element.top! - element.height! / 2, opacity: 0 };
            element.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                top: target.top,
                opacity: target.opacity,
                duration: entry.duration,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => element.set({ top: state.top, opacity: state.opacity }),
              },
              offset + (entry.duration / text.length) * index,
            );
          });
          break;
        }

        case "ascend": {
          const delta = FabricUtils.calculateAnimationPositionDelta(object);
          object._objects.map((line) => {
            if (!line.clipPath) {
              const top = object.top! + line.top! + object.height! / 2;
              const left = object.left! + line.left! + object.width! / 2;
              line.clipPath = createInstance(fabric.Rect, { angle, top, left, height: line.height, width: line.width, absolutePositioned: true });
            }
          });
          text.map((element, index) => {
            const target = { top: element.top!, left: element.left! };
            const state = { top: target.top + delta.y * element.height! * element.scaleY!, left: target.left - delta.x * element.height! * element.scaleX! };
            element.set(Object.assign({}, state));
            timeline.add(
              {
                targets: state,
                top: target.top,
                left: target.left,
                duration: entry.duration / text.length,
                easing: modifyAnimationEasing(entry.easing, entry.duration),
                update: () => element.set({ top: state.top, left: state.left }),
              },
              offset + (entry.duration / text.length) * index,
            );
          });
          break;
        }
      }
    }
  }

  private _exit(object: fabric.Object, timeline: anime.AnimeTimelineInstance, exit: AnimationTimeline["in"], state: AnimationState, _mask?: boolean, preview?: boolean) {
    if (!exit) return;

    const { left, top, height, width, angle, scaleX, scaleY } = state;
    const offset = preview ? 0 : object.meta!.offset + object.meta!.duration - exit.duration - this._exitOffset;

    switch (exit.name) {
      case "fade": {
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

      case "slide-left": {
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

      case "slide-right": {
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

      case "rise-up": {
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

      case "sink-down": {
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

      case "pop": {
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

      case "pan-left": {
        timeline.add(
          {
            targets: object,
            left: [left, left - Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "pan-right": {
        timeline.add(
          {
            targets: object,
            left: [left, left + Math.min((width * scaleX) / 2, Number.MAX_SAFE_INTEGER)],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "wipe": {
        let clipPath = object.clipPath;
        const delta = FabricUtils.calculateAnimationPositionDelta(object);
        const props = { angle, height, width, top: top - delta.x * delta.width, left: left + delta.y * delta.width, absolutePositioned: true };

        if (!clipPath) {
          clipPath = createInstance(fabric.Rect, props);
          object.set({ clipPath });
        }

        timeline.add(
          {
            targets: clipPath,
            left: [left, props.left],
            top: [props.top, top],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }

      case "baseline": {
        const delta = FabricUtils.calculateAnimationPositionDelta(object);
        if (!object.clipPath) object.clipPath = createInstance(fabric.Rect, { angle, height, width, top, left, absolutePositioned: true });

        timeline.add(
          {
            targets: object,
            top: [top, top - delta.y * delta.height],
            left: [left - delta.x * delta.height, left],
            duration: exit.duration,
            easing: modifyAnimationEasing(exit.easing, exit.duration),
          },
          offset,
        );
        break;
      }
    }
  }

  private _scene(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], scene: AnimationTimeline["scene"], state: AnimationState, mask?: boolean, preview?: boolean) {
    if (!scene) return;

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

  private _preview(element: fabric.Object, type: "in" | "out" | "scene", animation: AnimationTimeline, mask?: boolean) {
    const state = this._save(element);
    switch (type) {
      case "in":
        this._entry(element, this._timeline!, animation["in"], state, mask, true);
        break;
      case "out":
        this._exit(element, this._timeline!, animation["out"], state, mask, true);
        break;
      case "scene":
        this._scene(element, this._timeline!, animation["in"], animation["out"], animation["scene"], state, mask, true);
        break;
    }
  }

  private _initialize(object: fabric.Object, timeline: anime.AnimeTimelineInstance, entry: AnimationTimeline["in"], exit: AnimationTimeline["out"], scene: AnimationTimeline["scene"], mask?: boolean) {
    const state = this._save(object);
    this._entry(object, timeline, entry, state, mask);
    this._exit(object, timeline, exit, state, mask);
    this._scene(object, timeline, entry, exit, scene, state, mask);
  }

  preview(object: fabric.Object, type: "in" | "out" | "scene", animation: AnimationTimeline) {
    if (animation[type].name === "none") return;

    this.previewing = true;
    this._canvas.onToggleControls(false);
    const element = FabricUtils.isTextboxElement(object) ? this.text.animate(object, this.canvas) : object;

    this._active = object;
    this._timeline = anime.timeline({ update: this._update.bind(this), complete: this._complete.bind(this, element), endDelay: 2000, loop: true });

    if (element.clipPath) this._preview(element.clipPath, type, animation, true);
    this._preview(element, type, animation);

    this._timeline.play();
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
        if (object.clipPath) this._initialize(object.clipPath, timeline, object.anim!.in, object.anim!.out, object.anim!.scene, true);
        this._initialize(object, timeline, object.anim!.in, object.anim!.out, object.anim!.scene);
      }
    }
  }

  dispose(object = this._active) {
    this._timeline?.pause();
    anime.remove(this._timeline);

    this.canvas.remove(...this._extras);
    this._canvas.onToggleControls(true);

    this._extras = [];
    this._active = null;
    this._timeline = null;

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
