import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { makeAutoObservable } from "mobx";
import { fabric } from "fabric";
import { throttle } from "lodash";

interface WorkspaceDimensions {
  height?: number;
  width?: number;
}

export class CanvasWorkspace {
  private _canvas: Canvas;
  private _workspace: HTMLDivElement;

  fill: string;
  width: number;
  height: number;

  zoom: number;
  viewportTransform: number[];

  constructor(canvas: Canvas, workspace: HTMLDivElement) {
    this._canvas = canvas;
    this._workspace = workspace;

    this.width = 1080;
    this.height = 1080;
    this.fill = "#FFFFFF";

    this.zoom = 0.5;
    this.viewportTransform = [];

    this._init();
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._canvas.instance!;
  }

  private get artboard() {
    return this._canvas.artboard!;
  }

  private _init() {
    this._initObserver();
    this._initArtboard();
    this._initEvents();
  }

  private _initArtboard() {
    this.artboard.set({ height: this.height, width: this.width, fill: this.fill });
    this._workspaceCenterFromArtboard();
    this.canvas.requestRenderAll();
  }

  private _initObserver() {
    const resizeObserver = createInstance(
      ResizeObserver,
      throttle(() => {
        this.canvas.setDimensions({ height: this._workspace.offsetHeight, width: this._workspace.offsetWidth });
        this._workspaceCenterFromArtboard();
        this.canvas.requestRenderAll();
      }, 50),
    );
    resizeObserver.observe(this._workspace);
  }

  private _initEvents() {
    this.canvas!.on("mouse:wheel", this._mouseWheelEvent);
  }

  private _mouseWheelEvent(event: fabric.IEvent<WheelEvent>) {
    event.e.preventDefault();
    event.e.stopPropagation();

    if (event.e.ctrlKey) {
      let zoom = this.canvas!.getZoom();
      zoom *= 0.999 ** (event.e.deltaY * 5);

      if (zoom > 2.5) zoom = 2.5;
      if (zoom < 0.01) zoom = 0.01;

      const center = this.canvas.getCenter();
      this.canvas.zoomToPoint(createInstance(fabric.Point, center.left, center.top), zoom);
      this.canvas.requestRenderAll();

      this.zoom = zoom;
      this.viewportTransform = [...this.canvas.viewportTransform!];
    }
  }

  private _workspaceCenterFromArtboard() {
    const workspaceCenter = this.canvas.getCenter();
    this.canvas.setViewportTransform(fabric.iMatrix.concat());
    this.canvas.zoomToPoint(createInstance(fabric.Point, workspaceCenter.left, workspaceCenter.top), this.zoom);

    const artboardCenter = this.artboard.getCenterPoint();
    const viewportTransform = this.canvas.viewportTransform!;

    viewportTransform[4] = this.canvas.width! / 2 - artboardCenter.x * viewportTransform[0];
    viewportTransform[5] = this.canvas.height! / 2 - artboardCenter.y * viewportTransform[3];

    this.viewportTransform = [...viewportTransform];
    this.canvas.setViewportTransform(viewportTransform);
    this.canvas.requestRenderAll();
  }

  onResizeArtboard({ height, width }: WorkspaceDimensions) {
    if (height) {
      this.height = height;
      this.artboard.set("height", height);
    }
    if (width) {
      this.width = width;
      this.artboard.set("width", width);
    }
    this._workspaceCenterFromArtboard();
    this.canvas.requestRenderAll();
  }

  onChangeZoom(zoom: number) {
    this.zoom = zoom;
    this.canvas.setZoom(zoom);
  }

  onChangeFill(fill: string) {
    this.fill = fill;
    this.artboard.set({ fill });
  }
}
