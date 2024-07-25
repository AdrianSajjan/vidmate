import { fabric } from "fabric";
import { debounce, merge } from "lodash";
import { createInstance } from "@/lib/utils";
import Chart, { AnimationEvent, ChartConfiguration, Plugin } from "chart.js/auto";

const chartPlugins: Plugin[] = [];

const chartOptions: Partial<ChartConfiguration> = {
  plugins: chartPlugins,
  options: {
    responsive: false,
    maintainAspectRatio: false,
  },
};

const chartEvents = {
  mousemove: "mousemove",
  mousedown: "click",
  mouseout: "mouseout",
  touchstart: "touchstart",
  touchmove: "touchmove",
};

export class FabricChart extends fabric.Object {
  private __chart!: Chart;

  public static type = "chart";
  public chart = {} as ChartConfiguration;

  private __setChartConfiguration(options: Partial<ChartConfiguration>): FabricChart {
    const instance = this.__chart;
    this.chart = merge({}, this.chart, options);
    if (instance) {
      if (options.type && options.type !== (instance.config as ChartConfiguration).type) {
        instance.destroy();
        this.__createChart();
        return this;
      }
      instance.data = this.chart.data || instance.data;
      instance.options = this.chart.options || instance.options;
      this.__chart.update();
    }
    return this;
  }

  private __setChartSize() {
    const canvas = this.__chart.canvas!;
    canvas.width = this.getScaledWidth() * (window?.devicePixelRatio || 1);
    canvas.height = this.getScaledHeight() * (window?.devicePixelRatio || 1);
    this.__chart.resize();
  }

  private __defaultChartConfiguration() {
    return merge({}, chartOptions, {
      options: {
        onResize: (size: any) => {
          chartOptions.options?.onResize?.call(this.__chart, this.__chart, size);
          this.chart.options?.onResize?.call(this.__chart, this.__chart, size);
          this.dirty = true;
          this.canvas?.requestRenderAll();
        },
        animation: {
          onProgress: (event: AnimationEvent) => {
            if (chartOptions.options?.animation) chartOptions.options?.animation?.onProgress?.call(this.__chart, { ...event, chart: this.__chart });
            if (this.chart.options?.animation) this.chart.options?.animation?.onProgress?.call(this.__chart, { ...event, chart: this.__chart });
            this.dirty = true;
            this.canvas?.requestRenderAll();
          },
        },
      },
    });
  }

  private __getChartBoundingClientRect() {
    return {
      bottom: this.top! + this.getScaledHeight(),
      height: this.getScaledHeight(),
      left: this.left,
      right: this.left! + this.getScaledWidth(),
      top: this.top,
      width: this.getScaledWidth(),
      x: this.left! + this.getScaledWidth() / 2,
      y: this.top! + this.getScaledHeight() / 2,
    } as DOMRect;
  }

  private __getChartCurrentStyle() {
    return {
      "padding-left": 0,
      "padding-right": 0,
      "padding-top": 0,
      "padding-bottom": 0,
    } as Partial<CSSStyleDeclaration>;
  }

  private __createChartCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.getScaledWidth();
    canvas.height = this.getScaledHeight();
    Object.defineProperty(canvas, "clientWidth", { get: () => canvas.width / window.devicePixelRatio });
    Object.defineProperty(canvas, "clientHeight", { get: () => canvas.height / window.devicePixelRatio });
    Object.defineProperty(canvas, "getBoundingClientRect", { value: this.__getChartBoundingClientRect.bind(this) });
    Object.defineProperty(canvas, "currentStyle", { value: this.__getChartCurrentStyle() });
    return canvas;
  }

  private __bindChartEvents() {
    for (const name in chartEvents) {
      const event = name as keyof typeof chartEvents;
      this.on(event, (e) => {
        if (this.canvas && this.__chart.canvas) {
          let { x, y } = this.toLocalPoint(this.canvas.getPointer(e.e) as fabric.Point, "left", "top");
          if (this.flipX) x = this.getScaledWidth() - x;
          if (this.flipY) y = this.getScaledHeight() - y;
          this.__chart.canvas!.dispatchEvent(createInstance(MouseEvent, chartEvents[event], { clientX: this.left! + x, clientY: this.top! + y }));
        }
      });
    }
  }

  private __createChart() {
    const options = merge({}, this.chart, this.__defaultChartConfiguration());
    this.__chart = createInstance(Chart, this.__createChartCanvas(), options);
    return this.__chart;
  }

  public initialize(options?: fabric.IChartConfigurationOptions) {
    super.initialize(options);
    this.__createChart();
    this.__bindChartEvents();
    this.on("scaling", debounce(this.__setChartSize.bind(this), 50));
    return this;
  }

  public _set(key: string, value: any) {
    if (key === "chart") return this.__setChartConfiguration(value);
    return super._set(key, value);
  }

  public _render(ctx: CanvasRenderingContext2D) {
    if (this.__chart) ctx.drawImage(this.__chart.canvas!, -this.width! / 2, -this.height! / 2, this.width!, this.height!);
  }

  public static fromObject(options: fabric.IChartConfigurationOptions, callback: Function) {
    return callback?.(createInstance(fabric.Chart, options));
  }
}

const ChartObject = fabric.util.createClass(FabricChart, { type: FabricChart.type });
ChartObject.fromObject = FabricChart.fromObject;

fabric.Chart = ChartObject;
fabric.util.object.extend(fabric.util, {
  chart: {
    addPlugins(...plugins: any[]) {
      chartPlugins.push(...plugins);
    },
    setDefaults(options: Partial<ChartConfiguration>) {
      merge(chartOptions, options);
    },
  },
});
