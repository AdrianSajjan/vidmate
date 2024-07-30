import { fabric } from "fabric";
import { FabricUtils } from "@/fabric/utils";
import { createInstance } from "@/lib/utils";
import { makeAutoObservable } from "mobx";
import { Canvas } from "@/store/canvas";
import { clamp } from "lodash";

interface TextProps {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
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

  animated(text: string, { fontFamily, fontSize, fontWeight }: TextProps, animation: string) {
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
        const duration = 6000;
        const offset = 500;

        elements.map((element, index) => {
          FabricUtils.initializeMetaProperties(element, { group, duration: duration - 500 * index, offset: offset * index });
          FabricUtils.initializeAnimationProperties(element, { in: { name: "fade-in", duration: 250 }, out: { name: "fade-out", duration: 250 } });
        });

        this.canvas.add(...elements);
        this.canvas.requestRenderAll();

        const selection = createInstance(fabric.ActiveSelection, elements, { canvas: this.canvas });
        selection.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
        selection.setCoords();

        this.canvas.setActiveObject(selection);
        this.canvas.requestRenderAll();

        break;
      }

      case "individual-words": {
        words.map((word) => {
          const name = FabricUtils.elementID("text");
          const textbox = createInstance(fabric.Textbox, word, { name, fontFamily, fontWeight, fontSize, textAlign: "center", fill: "#FFFFFF" });
          textbox.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");
          elements.push(textbox);
        });

        const group = elements.map((element) => element.name!);
        const timeline = 6000 / words.length;
        const duration = clamp(50, 500 - 50 * words.length, 250);

        elements.map((element, index) => {
          FabricUtils.initializeMetaProperties(element, { group, duration: timeline, offset: timeline * index });
          FabricUtils.initializeAnimationProperties(element, { in: { name: "fade-in", duration: duration }, out: { name: "fade-out", duration: duration } });
        });

        this.canvas.add(...elements);
        this.canvas.setActiveObject(createInstance(fabric.ActiveSelection, elements, { canvas: this.canvas }));
        this.canvas.requestRenderAll();

        break;
      }
    }

    return elements;
  }
}
