import { customAlphabet } from "nanoid";
import { fabric } from "fabric";
import { createInstance } from "@/lib/utils";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export function isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
  return object?.type === "activeSelection";
}

export function elementID(prefix: string) {
  return prefix.toLowerCase() + "_" + nanoid(4);
}

export abstract class FabricUtils {
  static isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
    return object?.type === "activeSelection";
  }

  static elementID(prefix: string) {
    return prefix.toLowerCase() + "_" + nanoid(4);
  }

  static bindObjectTransformToParent(parent: fabric.Object, ...children: fabric.Object[]) {
    const invertedTransform = fabric.util.invertTransform(parent.calcTransformMatrix());
    for (const child of children) {
      if (!child.meta) child.meta = {};
      child.meta.relationship = fabric.util.multiplyTransformMatrices(invertedTransform, parent.calcTransformMatrix());
    }
  }

  static updateObjectTransformToParent(parent: fabric.Object, ...children: fabric.Object[]) {
    for (const child of children) {
      if (!child.meta?.relationship || !Array.isArray(child.meta?.relationship)) return;

      const transform = fabric.util.multiplyTransformMatrices(parent.calcTransformMatrix(), child.meta.relationship);
      const option = fabric.util.qrDecompose(transform);

      child.set({ flipX: false, flipY: false });
      child.setPositionByOrigin(createInstance(fabric.Point, option.translateX, option.translateY), "center", "center");

      child.set(option);
      child.setCoords();
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

  static linearEasing(t: number, b: number, c: number, d: number) {
    return b + (t / d) * c;
  }
}
