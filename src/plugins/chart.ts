import { fabric } from "fabric";
import { makeAutoObservable } from "mobx";

import { Canvas } from "@/store/canvas";
import { createInstance } from "@/lib/utils";
import { FabricUtils } from "@/fabric/utils";
import { ChartConfiguration, ChartTypeRegistry } from "chart.js";

export class CanvasChart {
  private _canvas: Canvas;

  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._initEvents();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private get artboard() {
    return this._canvas.artboard!;
  }

  private _initEvents() {}

  add(type: keyof ChartTypeRegistry, label?: string) {
    const options: ChartConfiguration = {
      type: type,
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{ label: label, data: [Math.random(), Math.random()], backgroundColor: ["red", "blue"] }],
      },
    };

    const chart = createInstance(fabric.Chart, { name: FabricUtils.elementID("bar-chart"), width: 500, height: 500, chart: options });
    chart.setPositionByOrigin(this.artboard.getCenterPoint(), "center", "center");

    FabricUtils.initializeMetaProperties(chart);
    FabricUtils.initializeAnimationProperties(chart);

    this.canvas.add(chart);
    this.canvas.setActiveObject(chart);
    this.canvas.requestRenderAll();

    return chart;
  }
}
