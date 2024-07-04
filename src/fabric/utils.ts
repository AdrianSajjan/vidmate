import _ from "lodash";

import { fabric } from "fabric";
import { customAlphabet } from "nanoid";

import { createInstance } from "@/lib/utils";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export abstract class FabricUtils {
  static isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
    return object?.type === "activeSelection";
  }

  static isImageElement(object?: fabric.Object | null): object is fabric.Image {
    return object?.type === "image";
  }

  static isVideoElement(object?: fabric.Object | null): object is fabric.Video {
    return object?.type === "video";
  }

  static elementID(prefix: string) {
    return prefix.toLowerCase() + "_" + nanoid(4);
  }

  static linearEasing(t: number, b: number, c: number, d: number) {
    return b + (t / d) * c;
  }

  static bindObjectTransformToParent(parent: fabric.Object, children: fabric.Object[]) {
    const invertedTransform = fabric.util.invertTransform(parent.calcTransformMatrix());
    for (const child of children) {
      if (!child.meta) child.meta = {};
      child.meta.relationship = fabric.util.multiplyTransformMatrices(invertedTransform, parent.calcTransformMatrix());
    }
  }

  static updateObjectTransformToParent(parent: fabric.Object, children: Array<{ object: fabric.Object; skip?: string[] }>) {
    for (const child of children) {
      if (!child.object.meta?.relationship || !Array.isArray(child.object.meta?.relationship)) return;

      const transform = fabric.util.multiplyTransformMatrices(parent.calcTransformMatrix(), child.object.meta.relationship);
      let decompose: Record<string, number> = fabric.util.qrDecompose(transform);
      if (child.skip) decompose = _.omit(decompose, child.skip);

      child.object.set({ flipX: false, flipY: false });
      child.object.setPositionByOrigin(createInstance(fabric.Point, decompose.translateX, decompose.translateY), "center", "center");

      child.object.set(decompose);
      child.object.setCoords();
    }
  }

  static objectSpinningAnimation(object: fabric.Object, duration = 750, loop = true) {
    object.animate("angle", object.angle! + 360, {
      duration: duration,
      onChange: () => object.canvas?.requestRenderAll(),
      onComplete: () => (loop ? this.objectSpinningAnimation(object) : null),
      easing: this.linearEasing,
    });
  }

  static checkHorizontalSnap(canvas: fabric.Canvas, artboard: fabric.Object, lineH: fabric.Line, a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (a > b - snapZone && a < b + snapZone) {
      lineH.opacity = 1;
      lineH.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.width! * event.target!.scaleX!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.width! * event.target!.scaleX!) / 2;
      }

      event.target!.set({ left: value }).setCoords();
      lineH.set({ x1: b, y1: artboard.top!, x2: b, y2: artboard.height! + artboard.top! }).setCoords();
      canvas.requestRenderAll();
    }
  }

  static checkVerticalSnap(canvas: fabric.Canvas, artboard: fabric.Object, lineV: fabric.Line, a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (a > b - snapZone && a < b + snapZone) {
      lineV.opacity = 1;
      lineV.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.height! * event.target!.scaleY!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.height! * event.target!.scaleY!) / 2;
      }

      event.target!.set({ top: value }).setCoords();
      lineV.set({ y1: b, x1: artboard.left!, y2: b, x2: artboard.width! + artboard.left! }).setCoords();
      canvas.requestRenderAll();
    }
  }
}
