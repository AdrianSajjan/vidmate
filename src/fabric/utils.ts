import { fabric } from "fabric";
import { customAlphabet } from "nanoid";
import { omit } from "lodash";
import { createInstance } from "@/lib/utils";

export interface TransformChildren {
  object: fabric.Object;
  skip?: string[];
  callback?: Function;
}

export abstract class FabricUtils {
  private static nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

  static isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
    return object?.type === "activeSelection";
  }

  static isImageElement(object?: fabric.Object | null): object is fabric.Image {
    return object?.type === "image" && !object?.meta?.placeholder;
  }

  static isVideoElement(object?: fabric.Object | null): object is fabric.Video {
    return object?.type === "video" && !object?.meta?.placeholder;
  }

  static elementID(prefix: string) {
    return prefix.toLowerCase() + "_" + this.nanoid(4);
  }

  static linearEasing(t: number, b: number, c: number, d: number) {
    return b + (t / d) * c;
  }

  static initializeMetaProperties(object: fabric.Object, props?: Record<string, any>) {
    object.meta = { duration: 5000, offset: 0, ...(object.meta || {}) };
    if (!props) return;
    for (const key in props) object.meta[key] = props[key];
  }

  static initializeAnimationProperties(object: fabric.Object) {
    object.anim = {
      in: { name: "none", duration: 0 },
      out: { name: "none", duration: 0 },
    };
  }

  static bindObjectTransformToParent(parent: fabric.Object, children: fabric.Object[]) {
    const invertedTransform = fabric.util.invertTransform(parent.calcTransformMatrix());
    for (const child of children) {
      if (!child.meta) child.meta = {};
      child.meta.relationship = fabric.util.multiplyTransformMatrices(invertedTransform, parent.calcTransformMatrix());
    }
  }

  static updateObjectTransformToParent(parent: fabric.Object, children: Array<TransformChildren>) {
    for (const child of children) {
      if (!child.object.meta?.relationship || !Array.isArray(child.object.meta?.relationship)) return;

      const transform = fabric.util.multiplyTransformMatrices(parent.calcTransformMatrix(), child.object.meta.relationship);
      let decompose: Record<string, number> = fabric.util.qrDecompose(transform);
      if (child.skip) decompose = omit(decompose, child.skip);

      child.object.set({ flipX: false, flipY: false });
      child.object.setPositionByOrigin(createInstance(fabric.Point, decompose.translateX, decompose.translateY), "center", "center");

      child.object.set(decompose);
      child.object.setCoords();
      child.callback?.();
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
}
