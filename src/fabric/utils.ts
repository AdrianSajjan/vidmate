import { createInstance } from "@/lib/utils";
import { EditorAudioElement } from "@/types/editor";
import { fabric } from "fabric";
import { omit } from "lodash";
import { customAlphabet } from "nanoid";

export interface TransformChildren {
  object: fabric.Object;
  skip?: string[];
  callback?: Function;
}

export abstract class FabricUtils {
  private static nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

  static isActiveSelection(object?: any): object is fabric.ActiveSelection {
    return object?.type === "activeSelection";
  }

  static isImageElement(object?: any): object is fabric.Image {
    return object?.type === "image" && !object?.meta?.placeholder;
  }

  static isVideoElement(object?: any): object is fabric.Video {
    return object?.type === "video" && !object?.meta?.placeholder;
  }

  static isChartElement(object?: any): object is fabric.Chart {
    return object?.type === "chart";
  }

  static isAudioElement(object?: any): object is EditorAudioElement {
    return object?.type === "audio";
  }

  static isTextboxElement(object?: any): object is fabric.Textbox {
    return object?.type === "textbox";
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
      child.meta.originalScaleX = child.scaleX;
      child.meta.originalScaleY = child.scaleY;
      child.meta.initialParentScaleX = parent.scaleX;
      child.meta.initialParentScaleY = parent.scaleY;
    }
  }

  static updateObjectTransformToParent(parent: fabric.Object, children: Array<TransformChildren>) {
    for (const child of children) {
      if (!child.object.meta || !child.object.meta.relationship || !Array.isArray(child.object.meta.relationship)) continue;

      const transform = fabric.util.multiplyTransformMatrices(parent.calcTransformMatrix(), child.object.meta.relationship);

      let decompose: Record<string, number> = fabric.util.qrDecompose(transform);
      if (child.skip) decompose = omit(decompose, child.skip);

      child.object.set({ flipX: false, flipY: false });
      child.object.setPositionByOrigin(createInstance(fabric.Point, decompose.translateX, decompose.translateY), "center", "center");

      const scaleFactorX = parent.scaleX! / child.object.meta.initialParentScaleX;
      const scaleFactorY = parent.scaleY! / child.object.meta.initialParentScaleY;
      const adjustedScaleX = child.object.meta.originalScaleX * scaleFactorX;
      const adjustedScaleY = child.object.meta.originalScaleY * scaleFactorY;

      child.object.set({ ...decompose, scaleX: adjustedScaleX, scaleY: adjustedScaleY });
      child.object.setCoords();

      child.callback?.();
    }
  }

  static applyObjectScaleToDimensions(object: fabric.Object, list?: string[]) {
    if (!list || list.includes(object.type!)) {
      switch (object.type) {
        case "textbox": {
          const textbox = object as fabric.Textbox;
          textbox.set({ fontSize: Math.round(textbox.fontSize! * textbox.scaleY!), width: textbox.width! * textbox.scaleX!, scaleY: 1, scaleX: 1 });
          break;
        }
        case "rect": {
          const width = object.width! * object.scaleX!;
          const height = object.height! * object.scaleY!;
          object.set({ width: width, height: height, scaleX: 1, scaleY: 1 });
          break;
        }
        case "triangle": {
          const width = object.width! * object.scaleX!;
          const height = object.height! * object.scaleY!;
          object.set({ width: width, height: height, scaleX: 1, scaleY: 1 });
          break;
        }
        case "ellipse": {
          const ellipse = object as fabric.Ellipse;
          const rx = ellipse.rx! * object.scaleX!;
          const ry = ellipse.ry! * object.scaleY!;
          ellipse.set({ rx: rx, ry: ry, scaleX: 1, scaleY: 1 });
          break;
        }
        case "circle": {
          const circle = object as fabric.Circle;
          const radius = circle.radius! * object.scaleX!;
          circle.set({ radius: radius, scaleX: 1, scaleY: 1 });
          break;
        }
        case "path": {
          const path = object as Required<fabric.Path>;
          const scaleX = 1 / path.scaleX;
          const scaleY = 1 / path.scaleY;
          const points = path.path as unknown as number[][];
          points.forEach((point) => {
            if (point[1] !== undefined) point[1] *= scaleX;
            if (point[2] !== undefined) point[2] *= scaleY;
          });
          object.set({ scaleX: 1, scaleY: 1 });
          break;
        }
      }
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

  static applyTransformationsAfterLoad(canvas: fabric.Canvas | fabric.StaticCanvas) {
    canvas.forEachObject((object) => {
      if (object.clipPath) {
        const existing = canvas.getItemByName(object.clipPath.name);
        if (existing) canvas.remove(existing);

        canvas.add(object.clipPath);
        FabricUtils.bindObjectTransformToParent(object, [object.clipPath]);
        const handler = () => FabricUtils.updateObjectTransformToParent(object, [{ object: object.clipPath! }]);

        object.on("moving", handler);
        object.on("scaling", handler);
        object.on("rotating", handler);
      }
    });
  }

  static convertGradient(angle: number) {
    const radians = angle * (Math.PI / 180);
    const x1 = 0.5 + Math.cos(radians) * 0.5;
    const y1 = 0.5 + Math.sin(radians) * 0.5;
    const x2 = 0.5 - Math.cos(radians) * 0.5;
    const y2 = 0.5 - Math.sin(radians) * 0.5;
    return { x1, y1, x2, y2 };
  }

  static revertGradient({ x1, y1, x2, y2 }: any) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angleRadians = Math.atan2(dy, dx);
    let angleDegrees = angleRadians * (180 / Math.PI);
    if (angleDegrees < 0) angleDegrees += 360;
    return Math.round(angleDegrees);
  }
}
