import { fabric } from "fabric";
import { makeAutoObservable } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";

interface TextProps {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  duration?: number;
  offset?: number;
}

export class CanvasText {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private get artboard() {
    return this._canvas.artboard!;
  }

  animated(text: string, { fontFamily, fontSize, fontWeight, offset = 0, duration = 6000 }: TextProps, animation: string, skip?: boolean) {
    const elements: fabric.Textbox[] = [];
    const words = text.split(" ");

    switch (animation) {
      case "typewriter": {
        let left = 0;

        words.map((word) => {
          const name = FabricUtils.elementID("text");
          const textbox = createInstance(fabric.Textbox, word, { name, fontFamily, fontWeight, fontSize, left, fill: "#FFFFFF" });
          const width = createInstance(fabric.Text, word + " ", { fontFamily, fontWeight, fontSize }).width!;
          left = left + width;
          elements.push(textbox);
        });

        const group = elements.map((element) => element.name!);
        const timeline = duration / words.length;
        const animation = 100;

        elements.map((element, index) => {
          FabricUtils.initializeMetaProperties(element, { group, duration: duration - timeline * index, offset: offset + timeline * index });
          FabricUtils.initializeAnimationProperties(element, { in: { name: "fade-in", duration: animation }, out: { name: "fade-out", duration: animation } });
        });

        this.canvas.add(...elements);
        const selection = createInstance(fabric.ActiveSelection, elements, { canvas: this.canvas });

        if (!skip) {
          selection.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
          this.canvas.setActiveObject(selection);
        }

        this.canvas.requestRenderAll();
        return selection;
      }

      case "subtitle": {
        words.map((word) => {
          const name = FabricUtils.elementID("text");
          const props = { textAlign: "center", strokeWidth: 4, strokeLineCap: "round", strokeLineJoin: "round", stroke: "#000000", fill: "#FFFFFF" };
          const textbox = createInstance(fabric.Textbox, word, { name, fontFamily, fontWeight, fontSize, ...props });
          textbox.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
          elements.push(textbox);
        });

        const group = elements.map((element) => element.name!);
        const timeline = duration / words.length;
        const animation = 100;

        elements.map((element, index) => {
          FabricUtils.initializeMetaProperties(element, { group, duration: timeline, offset: offset + timeline * index });
          FabricUtils.initializeAnimationProperties(element, { in: { name: "fade-in", duration: animation }, out: { name: "fade-out", duration: animation } });
        });

        this.canvas.add(...elements);
        const selection = createInstance(fabric.ActiveSelection, elements, { canvas: this.canvas });

        if (!skip) {
          selection.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
          this.canvas.setActiveObject(selection);
        }

        this.canvas.requestRenderAll();
        return selection;
      }
    }
  }
}
