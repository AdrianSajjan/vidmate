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
        datasets: [{ label: label, data: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()], backgroundColor: ["red", "blue", "yellow", "green", "purple", "orange"] }],
      },
      options: {
        scales: {
          x: { grid: { display: true } },
          y: { grid: { display: true } },
        },
        elements: {
          bar: {
            borderRadius: 0,
          },
          point: {
            radius: 3,
          },
          arc: {
            circular: true,
          },
        },
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

  updateChartOptions(chart: fabric.Chart, options: ChartConfiguration["options"]) {
    if (!FabricUtils.isChartElement(chart)) return;

    chart._set("chart", { options });
    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  updateActiveChartOptions(options: ChartConfiguration["options"]) {
    this.updateChartOptions(this.canvas._activeObject as fabric.Chart, options);
  }

  updateChartLabels(chart: fabric.Chart, data: ChartConfiguration["data"]) {
    if (!FabricUtils.isChartElement(chart)) return;

    console.log(data);

    chart._set("chart", {
      data: data,
    });
    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  updateActiveChartLabels(data: ChartConfiguration["data"]) {
    this.updateChartLabels(this.canvas._activeObject as fabric.Chart, data);
  }

  changeChartType(chart: fabric.Chart, type: keyof ChartTypeRegistry) {
    if (!FabricUtils.isChartElement(chart)) return;
    chart._set("chart", { ...chart.chart, type: type });

    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  changeActiveChartType(type: keyof ChartTypeRegistry) {
    this.changeChartType(this.canvas._activeObject as fabric.Chart, type);
  }

  toggleChartGridlines(chart: fabric.Chart, grid: string = "both") {
    if (!FabricUtils.isChartElement(chart)) return;

    let scales;

    if (grid === "y") {
      scales = {
        x: { grid: { display: true } },
        y: { grid: { display: false } },
      };
    } else if (grid === "x") {
      scales = {
        x: { grid: { display: false } },
        y: { grid: { display: true } },
      };
    } else if (grid === "both") {
      scales = {
        x: { grid: { display: true } },
        y: { grid: { display: true } },
      };
    } else if (grid === "none") {
      scales = {
        x: { grid: { display: false } },
        y: { grid: { display: false } },
      };
    }

    chart._set("chart", { options: { scales } });

    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  toggleActiveChartGridlines(grid: string) {
    this.toggleChartGridlines(this.canvas._activeObject as fabric.Chart, grid);
  }

  changeChartBorderRadius(chart: fabric.Chart, radius: number) {
    if (!FabricUtils.isChartElement(chart)) return;
    chart._set("chart", {
      options: {
        ...chart.chart.options,
        elements: {
          bar: {
            borderRadius: radius,
          },
        },
      },
    });

    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  changeActiveChartBorderRadius(radius: number) {
    this.changeChartBorderRadius(this.canvas._activeObject as fabric.Chart, radius);
  }

  chnageChartPointRadius(chart: fabric.Chart, radius: number) {
    if (!FabricUtils.isChartElement(chart)) return;
    if (chart.chart.type !== "line") return;
    chart._set("chart", {
      options: {
        ...chart.chart.options,
        elements: {
          point: {
            radius: radius,
          },
        },
      },
    });

    this.canvas.fire("object:modified", { target: chart });
    this.canvas.requestRenderAll();
  }

  changeActiveChartPointRadius(radius: number) {
    this.chnageChartPointRadius(this.canvas._activeObject as fabric.Chart, radius);
  }
}
