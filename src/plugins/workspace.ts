import { makeAutoObservable, runInAction } from "mobx";
import { fabric } from "fabric";
import { clamp, throttle } from "lodash";
import { createInstance } from "@/lib/utils";
import { Canvas } from "@/store/canvas";
import { maxZoom, minZoom } from "@/constants/editor";

interface WorkspaceDimensions {
  height?: number;
  width?: number;
}

export class CanvasWorkspace {
  private _canvas: Canvas;
  private _workspace: HTMLDivElement;

  private _touchZoomScale: number;
  private _canTouchScale: boolean;

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

    this.zoom = window.innerWidth > 640 ? 0.5 : 0.3;
    this.viewportTransform = [];

    this._touchZoomScale = this.zoom;
    this._canTouchScale = true;

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
    this.canvas.on("mouse:wheel", this._mouseWheelEvent.bind(this));
    this.canvas.on("touch:gesture", this._touchGestureEvent.bind(this));
    this.canvas.on("selection:created", this._selectionCreatedEvent.bind(this));
    this.canvas.on("selection:cleared", this._selectionClearedEvent.bind(this));
  }

  private _selectionCreatedEvent() {
    runInAction(() => {
      this._canTouchScale = false;
    });
  }

  private _selectionClearedEvent() {
    runInAction(() => {
      this._canTouchScale = true;
    });
  }

  private _touchGestureEvent(event: fabric.IEvent<TouchEvent>) {
    if (!event.e.touches || event.e.touches.length !== 2 || !this._canTouchScale) return;

    const touch = event as any;
    if (touch.self.state == "start") this._touchZoomScale = this.canvas.getZoom();
    let zoom = this._touchZoomScale * touch.self.scale;

    if (zoom > maxZoom) zoom = maxZoom;
    if (zoom < minZoom) zoom = minZoom;

    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(createInstance(fabric.Point, center.left, center.top), zoom);
    this.canvas.requestRenderAll();

    runInAction(() => {
      this.zoom = zoom;
      this.viewportTransform = [...this.canvas.viewportTransform!];
    });
  }

  private _mouseWheelEvent(event: fabric.IEvent<WheelEvent>) {
    event.e.preventDefault();
    event.e.stopPropagation();

    if (event.e.ctrlKey) {
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** (event.e.deltaY * 5);

      if (zoom > maxZoom) zoom = maxZoom;
      if (zoom < minZoom) zoom = minZoom;

      const center = this.canvas.getCenter();
      this.canvas.zoomToPoint(createInstance(fabric.Point, center.left, center.top), zoom);
      this.canvas.requestRenderAll();

      runInAction(() => {
        this.zoom = zoom;
        this.viewportTransform = [...this.canvas.viewportTransform!];
      });
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

  resizeArtboard({ height, width }: WorkspaceDimensions) {
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

  changeZoom(zoom: number) {
    this.zoom = clamp(zoom, minZoom, maxZoom);
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);
    this.viewportTransform = [...this.canvas.viewportTransform!];
  }

  changeFill(fill: string) {
    this.fill = fill;
    this.artboard.set({ fill });
  }
}
