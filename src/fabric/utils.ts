import { customAlphabet } from "nanoid";
import { fabric } from "fabric";
import { createInstance } from "@/lib/utils";
import _ from "lodash";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export abstract class FabricUtils {
  static isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
    return object?.type === "activeSelection";
  }

  static elementID(prefix: string) {
    return prefix.toLowerCase() + "_" + nanoid(4);
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

  static linearEasing(t: number, b: number, c: number, d: number) {
    return b + (t / d) * c;
  }
}
