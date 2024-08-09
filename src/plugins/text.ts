import { fabric } from "fabric";
import { maxBy, sum } from "lodash";
import { makeAutoObservable } from "mobx";

import { createInstance, createMap } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

interface AnimatedTextState {
  textbox: fabric.Textbox;
  group: fabric.Group;
}

export class CanvasText {
  private _canvas: Canvas;
  animated: Map<string, AnimatedTextState>;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this.animated = createMap();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private _transformText(text: string, textTransform?: string) {
    switch (textTransform) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      default:
        return text;
    }
  }

  animate(textbox: fabric.Textbox, canvas: fabric.Canvas | fabric.StaticCanvas) {
    const words: fabric.Group[] = [];
    const exclude = { excludeFromTimeline: true, excludeFromExport: true, excludeFromAlignment: true };

    for (let outer = 0; outer < textbox.__charBounds!.length; outer++) {
      const letters: fabric.IText[] = [];
      const char = textbox._textLines[outer];

      for (let inner = 0; inner < char.length; inner++) {
        const bounds = textbox.__charBounds![outer][inner];
        const character = this._transformText(char[inner], textbox.textTransform);

        const fonts = { fontFamily: textbox.fontFamily, fontSize: textbox.fontSize! * textbox.scaleY!, fontStyle: textbox.fontStyle, fontWeight: textbox.fontWeight };
        const decorations = { underline: textbox.underline, fill: textbox.fill, linethrough: textbox.linethrough };
        const dimensions = { top: sum(textbox.__lineHeights.slice(0, outer)), left: bounds.left, scaleX: 1, scaleY: 1 };

        const letter = createInstance(fabric.IText, character, Object.assign({}, exclude, fonts, dimensions, decorations));
        letters.push(letter);
      }

      const group = createInstance(fabric.Group, letters, Object.assign({}, exclude));
      words.push(group);
    }

    const group = createInstance(fabric.Group, words, Object.assign({ type: "animated-text", name: "animated_" + textbox.name, meta: textbox.meta, anim: textbox.anim }, exclude));
    const longest = maxBy(words, "width")!;

    for (const word of words) {
      if (word === longest) continue;
      switch (textbox.textAlign) {
        case "left":
          word.setPositionByOrigin(createInstance(fabric.Point, longest.left!, word.getCenterPoint().y), "left", "center");
          break;
        case "center":
          word.setPositionByOrigin(createInstance(fabric.Point, longest.getCenterPoint().x, word.getCenterPoint().y), "center", "center");
          break;
        case "right":
          word.setPositionByOrigin(createInstance(fabric.Point, longest.left! + longest.width!, word.getCenterPoint().y), "right", "center");
          break;
      }
    }

    group.setPositionByOrigin(textbox.getCenterPoint(), "center", "center");
    textbox.set({ visible: false, hasBorders: false, hasControls: false });
    canvas.add(group);

    this.animated.set(textbox.name!, { textbox, group });
    canvas.requestRenderAll();
    return group;
  }

  restore(_id: string) {
    const id = _id.replace("animated_", "");
    if (!this.animated.has(id)) return;

    const animated = this.animated.get(id)!;
    this.animated.delete(id);

    animated.textbox.set({ visible: true, hasBorders: true, hasControls: true });
    this.canvas.remove(animated.group);
  }
}
