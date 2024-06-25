import { isActiveSelection } from "@/fabric/utils";
import { createInstance, elementID } from "@/lib/utils";
import { fabric } from "fabric";
import { makeAutoObservable } from "mobx";

export const artboardHeight = 1080;
export const artboardWidth = 1080;
export const canvasYPadding = 100;
export const artboardFill = "#FFFFFF";

export class Canvas {
  instance?: fabric.Canvas;
  artboard?: fabric.Rect;

  verticalGuideline?: fabric.Line;
  horizontalGuideline?: fabric.Line;

  elements: fabric.Object[];
  selected?: fabric.Object | null;

  duration: number;
  seek: number;

  zoom: number;
  fill: string;

  width: number;
  height: number;

  constructor() {
    this.zoom = 0.5;
    this.fill = artboardFill;

    this.duration = 30000;
    this.seek = 0;

    this.width = artboardWidth;
    this.height = artboardHeight;

    this.elements = [];
    makeAutoObservable(this);
  }

  private onInitializeGuidelines() {
    if (!this.instance || !this.artboard) return;

    const hCenter = this.artboard.left! + this.artboard.width! / 2;
    const vCenter = this.artboard.top! + this.artboard.height! / 2;

    this.instance.add(
      createInstance(fabric.Line, [hCenter, 0, hCenter, this.instance.height!], {
        opacity: 0,
        selectable: false,
        evented: false,
        name: "center_h",
      })
    );
    this.instance.add(
      createInstance(fabric.Line, [0, vCenter, this.instance.width!, vCenter], {
        opacity: 0,
        selectable: false,
        evented: false,
        name: "center_v",
      })
    );

    this.horizontalGuideline = createInstance(fabric.Line, [hCenter, this.artboard.top!, hCenter, this.artboard.height! + this.artboard.top!], {
      stroke: "red",
      opacity: 0,
      selectable: false,
      evented: false,
      name: "line_h",
    });
    this.verticalGuideline = createInstance(fabric.Line, [this.artboard.left!, vCenter, this.artboard.width! + this.artboard.left!, vCenter], {
      stroke: "red",
      opacity: 0,
      selectable: false,
      evented: false,
      name: "line_v",
    });

    this.instance.add(this.verticalGuideline);
    this.instance.add(this.horizontalGuideline);

    this.instance.requestRenderAll();
  }

  private onSnapToGuidelines(event: fabric.IEvent<MouseEvent>) {
    if (!this.horizontalGuideline || !this.verticalGuideline || !this.instance) return;

    this.horizontalGuideline.opacity = 0;
    this.verticalGuideline.opacity = 0;
    this.instance.requestRenderAll();

    const snapZone = 5;
    const targetLeft = event.target!.left!;
    const targetTop = event.target!.top!;
    const targetWidth = event.target!.width! * event.target!.scaleX!;
    const targetHeight = event.target!.height! * event.target!.scaleY!;

    this.instance.forEachObject((obj) => {
      if (obj != event.target && obj != this.horizontalGuideline && obj != this.verticalGuideline) {
        if (obj.get("name") == "center_h" || obj.get("name") == "center_v") {
          const check1 = [[targetLeft, obj.left!, 1]];
          const check2 = [[targetTop, obj.top!, 1]];

          for (let i = 0; i < check1.length; i++) {
            this.checkHorizontalSnap(check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            this.checkVerticalSnap(check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
          }
        } else {
          const check1 = [
            [targetLeft, obj.left!, 1],
            [targetLeft, obj.left! + (obj.width! * obj.scaleX!) / 2, 1],
            [targetLeft, obj.left! - (obj.width! * obj.scaleX!) / 2, 1],
            [targetLeft + targetWidth / 2, obj.left!, 2],
            [targetLeft + targetWidth / 2, obj.left! + (obj.width! * obj.scaleX!) / 2, 2],
            [targetLeft + targetWidth / 2, obj.left! - (obj.width! * obj.scaleX!) / 2, 2],
            [targetLeft - targetWidth / 2, obj.left!, 3],
            [targetLeft - targetWidth / 2, obj.left! + (obj.width! * obj.scaleX!) / 2, 3],
            [targetLeft - targetWidth / 2, obj.left! - (obj.width! * obj.scaleX!) / 2, 3],
          ];
          const check2 = [
            [targetTop, obj.top!, 1],
            [targetTop, obj.top! + (obj.height! * obj.scaleY!) / 2, 1],
            [targetTop, obj.top! - (obj.height! * obj.scaleY!) / 2, 1],
            [targetTop + targetHeight / 2, obj.top!, 2],
            [targetTop + targetHeight / 2, obj.top! + (obj.height! * obj.scaleY!) / 2, 2],
            [targetTop + targetHeight / 2, obj.top! - (obj.height! * obj.scaleY!) / 2, 2],
            [targetTop - targetHeight / 2, obj.top!, 3],
            [targetTop - targetHeight / 2, obj.top! + (obj.height! * obj.scaleY!) / 2, 3],
            [targetTop - targetHeight / 2, obj.top! - (obj.height! * obj.scaleY!) / 2, 3],
          ];

          for (let i = 0; i < check1.length; i++) {
            this.checkHorizontalSnap(check1[i][0], check1[i][1], snapZone, event, check1[i][2]);
            this.checkVerticalSnap(check2[i][0], check2[i][1], snapZone, event, check2[i][2]);
          }
        }
      }
    });
  }

  private checkHorizontalSnap(a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (!this.horizontalGuideline || !this.artboard || !this.instance) return;

    if (a > b - snapZone && a < b + snapZone) {
      this.horizontalGuideline.opacity = 1;
      this.horizontalGuideline.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.width! * event.target!.scaleX!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.width! * event.target!.scaleX!) / 2;
      }

      event.target!.set({ left: value }).setCoords();
      this.horizontalGuideline.set({ x1: b, y1: this.artboard.top!, x2: b, y2: this.artboard.height! + this.artboard.top! }).setCoords();
      this.instance.requestRenderAll();
    }
  }

  private checkVerticalSnap(a: number, b: number, snapZone: number, event: fabric.IEvent<MouseEvent>, type: number) {
    if (!this.verticalGuideline || !this.artboard || !this.instance) return;

    if (a > b - snapZone && a < b + snapZone) {
      this.verticalGuideline.opacity = 1;
      this.verticalGuideline.bringToFront();

      let value = b;

      if (type == 1) {
        value = b;
      } else if (type == 2) {
        value = b - (event.target!.height! * event.target!.scaleY!) / 2;
      } else if (type == 3) {
        value = b + (event.target!.height! * event.target!.scaleY!) / 2;
      }

      event.target!.set({ top: value }).setCoords();
      this.verticalGuideline.set({ y1: b, x1: this.artboard.left!, y2: b, x2: this.artboard.width! + this.artboard.left! }).setCoords();
      this.instance.requestRenderAll();
    }
  }

  private onResetGuidelines() {
    if (!this.horizontalGuideline || !this.verticalGuideline) return;
    this.horizontalGuideline.opacity = 0;
    this.verticalGuideline.opacity = 0;
  }

  private onDeleteGuidelines() {
    if (!this.instance) return;

    const centerH = this.instance.getItemByName("center_h");
    const centerV = this.instance.getItemByName("center_v");

    const lineH = this.instance.getItemByName("line_h");
    const lineV = this.instance.getItemByName("line_v");

    if (centerH) this.instance.remove(centerH);
    if (centerV) this.instance.remove(centerV);

    if (lineH) this.instance.remove(lineH);
    if (lineV) this.instance.remove(lineV);
  }

  private onUpdateSelection() {
    this.selected = null;
    this.selected = this.instance?.getActiveObject();
  }

  private onCenterArtboard() {
    if (!this.instance || !this.artboard) return;

    const center = this.instance.getCenter();

    this.instance.setViewportTransform(fabric.iMatrix.concat());
    this.instance.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);

    const artboardCenter = this.artboard.getCenterPoint();
    const viewportTransform = this.instance.viewportTransform!;

    viewportTransform[4] = this.instance.width! / 2 - artboardCenter.x * viewportTransform[0];
    viewportTransform[5] = this.instance.height! / 2 - artboardCenter.y * viewportTransform[3];

    this.instance.setViewportTransform(viewportTransform);
    this.instance.requestRenderAll();
  }

  onInitialize(element: HTMLCanvasElement) {
    this.instance = createInstance(fabric.Canvas, element, { stateful: true, centeredRotation: true, backgroundColor: "#F0F0F0", preserveObjectStacking: true, controlsAboveOverlay: true });
    this.artboard = createInstance(fabric.Rect, { name: "artboard", height: this.height, width: this.width, fill: this.fill, rx: 0, ry: 0, selectable: false, hoverCursor: "default" });

    this.instance.selectionColor = "rgba(46, 115, 252, 0.11)";
    this.instance.selectionBorderColor = "rgba(98, 155, 255, 0.81)";
    this.instance.selectionLineWidth = 1.5;
    this.instance.meta = {};

    this.instance.add(this.artboard);
    this.instance.clipPath = this.artboard;

    this.zoom = 0.5;
    this.instance.setZoom(this.zoom);

    this.instance.requestRenderAll();
  }

  onInitializeEvents() {
    if (!this.instance) return;

    this.instance.on("object:moving", (event) => {
      event.target!.hasControls = false;
      this.onSnapToGuidelines(event);
    });

    this.instance.on("object:scaling", (event) => {
      event.target!.hasControls = false;
    });

    this.instance.on("object:resizing", (event) => {
      event.target!.hasControls = false;
    });

    this.instance.on("object:rotating", (event) => {
      event.target!.hasControls = false;
    });

    this.instance.on("object:modified", (event) => {
      event.target!.hasControls = true;
      this.onResetGuidelines();
    });

    this.instance.on("selection:created", () => {
      this.onUpdateSelection();
    });

    this.instance.on("selection:updated", () => {
      this.onUpdateSelection();
    });

    this.instance.on("selection:cleared", () => {
      this.onUpdateSelection();
    });

    this.instance.on("mouse:wheel", (event) => {
      event.e.preventDefault();
      event.e.stopPropagation();

      if (event.e.ctrlKey) {
        if (!this.instance || !this.artboard) return;

        this.zoom = this.instance.getZoom();
        this.zoom *= 0.999 ** event.e.deltaY;

        if (this.zoom > 20) this.zoom = 20;
        if (this.zoom < 0.01) this.zoom = 0.01;

        const center = this.instance.getCenter();
        this.instance.zoomToPoint(createInstance(fabric.Point, center.left, center.top), this.zoom);

        this.instance.requestRenderAll();
      }
    });
  }

  onUpdateResponsiveCanvas({ height, width }: { height: number; width: number }) {
    if (!this.instance || !this.artboard) return;

    this.onDeleteGuidelines();
    this.instance.discardActiveObject();

    this.instance.setDimensions({ width, height });
    this.onCenterArtboard();

    this.onInitializeGuidelines();
    this.instance.requestRenderAll();
  }

  onUpdateDimensions({ height, width }: { height?: number; width?: number }) {
    if (!this.artboard || !this.instance) return;

    if (height) {
      this.height = height;
      this.artboard?.set("height", height);
    }

    if (width) {
      this.width = width;
      this.artboard.set("width", width);
    }

    this.onCenterArtboard();
    this.instance.requestRenderAll();
  }

  onAddText(text: string) {
    if (!this.artboard || !this.instance) return;

    const object = createInstance(fabric.Textbox, text, {
      name: elementID("text"),
      left: this.artboard.left! + this.artboard.width! / 2,
      top: this.artboard.top! + this.artboard.height! / 2,
      objectCaching: false,
      textAlign: "center",
    });

    this.instance.add(object);
    this.instance.setActiveObject(object);
    this.instance.requestRenderAll();

    this.elements.push(object);
    this.selected = object;
  }

  onCreateSelection(object: fabric.Object, multiple?: boolean) {
    if (!this.instance) return;

    const selected = this.instance.getActiveObject();

    if (!selected || !multiple) {
      this.instance.setActiveObject(object);
    } else {
      if (isActiveSelection(selected)) {
        if (object.group === selected) {
          if (selected._objects.length === 1) {
            this.instance.discardActiveObject();
          } else {
            selected.removeWithUpdate(object);
            this.instance.fire("selection:updated");
          }
        } else {
          selected.addWithUpdate(object);
          this.instance.fire("selection:updated");
        }
      } else {
        if (selected.name !== object.name) {
          const activeSelection = createInstance(fabric.ActiveSelection, [selected, object], { canvas: this.instance });
          this.instance.setActiveObject(activeSelection);
        }
      }
    }
    this.instance.requestRenderAll();
  }

  onChangeSeekTime(seek: number) {
    this.seek = seek * 1000;
  }

  onChangeDuration(duration: number) {
    this.duration = duration * 1000;
  }
}
