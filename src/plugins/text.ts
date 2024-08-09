import { fabric } from "fabric";
import { sum } from "lodash";
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
    const lines: fabric.Group[] = [];
    const exclude = { excludeFromTimeline: true, excludeFromExport: true, excludeFromAlignment: true };

    for (let outer = 0; outer < textbox.__charBounds!.length; outer++) {
      let word: fabric.Text[] = [];
      let line: fabric.Group[] = [];
      const char = textbox._textLines[outer];

      for (let inner = 0; inner < char.length; inner++) {
        const bounds = textbox.__charBounds![outer][inner];
        const character = this._transformText(char[inner], textbox.textTransform);

        const fonts = { fontFamily: textbox.fontFamily, fontSize: textbox.fontSize! * textbox.scaleY!, fontStyle: textbox.fontStyle, fontWeight: textbox.fontWeight };
        const decorations = { underline: textbox.underline, fill: textbox.fill, linethrough: textbox.linethrough };
        const dimensions = { top: sum(textbox.__lineHeights.slice(0, outer)), left: bounds.left, scaleX: 1, scaleY: 1 };

        if (character !== " ") {
          const letter = createInstance(fabric.Text, character, Object.assign({}, exclude, fonts, dimensions, decorations));
          word.push(letter);
        }

        if (character === " " || inner === char.length - 1) {
          line.push(createInstance(fabric.Group, word, Object.assign({}, exclude)));
          word = [];
        }
      }

      const group = createInstance(fabric.Group, line, Object.assign({}, exclude));
      lines.push(group);
    }

    const rect = createInstance(fabric.Rect, Object.assign({ height: textbox.height! * textbox.scaleY!, width: textbox.width! * textbox.scaleX!, visible: false }, exclude));
    const group = createInstance(fabric.Group, [...lines, rect], Object.assign({ type: "animated-text", name: "animated_" + textbox.name, meta: textbox.meta, anim: textbox.anim }, exclude));

    for (const word of lines) {
      switch (textbox.textAlign) {
        case "left":
          word.setPositionByOrigin(createInstance(fabric.Point, rect.left!, word.getCenterPoint().y), "left", "center");
          break;
        case "center":
          word.setPositionByOrigin(createInstance(fabric.Point, rect.getCenterPoint().x, word.getCenterPoint().y), "center", "center");
          break;
        case "right":
          word.setPositionByOrigin(createInstance(fabric.Point, rect.left! + rect.width!, word.getCenterPoint().y), "right", "center");
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
