import { fabric } from "fabric";

import EdgeControl from "@/assets/editor/controls/edge-control.svg";
import MiddleControl from "@/assets/editor/controls/middle-control.svg";
import MiddleControlHoz from "@/assets/editor/controls/middle-control-hoz.svg";

import RotationControl from "@/assets/editor/controls/rotate-icon.svg";
import CropControl from "@/assets/editor/controls/crop-icon.svg";

const middleControl = document.createElement("img");
middleControl.src = MiddleControl;

const middleControlHoz = document.createElement("img");
middleControlHoz.src = MiddleControlHoz;

const edgeControl = document.createElement("img");
edgeControl.src = EdgeControl;

const rotationControl = document.createElement("img");
rotationControl.src = RotationControl;

const cropControl = document.createElement("img");
cropControl.src = CropControl;

function renderIcon(ctx: CanvasRenderingContext2D, left: number, top: number, _: unknown, fabricObject: fabric.Object) {
  const wsize = 20;
  const hsize = 25;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  ctx.drawImage(middleControl, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}

function renderIconHoz(ctx: CanvasRenderingContext2D, left: number, top: number, _: unknown, fabricObject: fabric.Object) {
  const wsize = 25;
  const hsize = 20;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  ctx.drawImage(middleControlHoz, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}

function renderIconEdge(ctx: CanvasRenderingContext2D, left: number, top: number, _: unknown, fabricObject: fabric.Object) {
  const wsize = 25;
  const hsize = 25;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  ctx.drawImage(edgeControl, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}

function renderIconCrop(rotate: number) {
  return (ctx: CanvasRenderingContext2D, left: number, top: number, _: unknown, _fabricObject: fabric.Object) => {
    const wsize = 25;
    const hsize = 25;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(rotate));
    ctx.drawImage(cropControl, -wsize / 2, -hsize / 2, wsize, hsize);
    ctx.restore();
  };
}

function renderIconRotate(ctx: CanvasRenderingContext2D, left: number, top: number, _: unknown, fabricObject: fabric.Object) {
  const wsize = 40;
  const hsize = 40;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  ctx.drawImage(rotationControl, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}

fabric.Object.prototype.controls.ml = new fabric.Control({
  x: -0.5,
  y: 0,
  offsetX: -1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
  getActionName: fabric.controlsUtils.scaleOrSkewActionName,
  render: renderIcon,
});

fabric.Object.prototype.controls.mr = new fabric.Control({
  x: 0.5,
  y: 0,
  offsetX: 1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
  getActionName: fabric.controlsUtils.scaleOrSkewActionName,
  render: renderIcon,
});

fabric.Object.prototype.controls.mb = new fabric.Control({
  x: 0,
  y: 0.5,
  offsetY: 1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
  getActionName: fabric.controlsUtils.scaleOrSkewActionName,
  render: renderIconHoz,
});

fabric.Object.prototype.controls.mt = new fabric.Control({
  x: 0,
  y: -0.5,
  offsetY: -1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
  getActionName: fabric.controlsUtils.scaleOrSkewActionName,
  render: renderIconHoz,
});

fabric.Object.prototype.controls.tl = new fabric.Control({
  x: -0.5,
  y: -0.5,
  cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingEqually,
  render: renderIconEdge,
});

fabric.Object.prototype.controls.tr = new fabric.Control({
  x: 0.5,
  y: -0.5,
  cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingEqually,
  render: renderIconEdge,
});

fabric.Object.prototype.controls.bl = new fabric.Control({
  x: -0.5,
  y: 0.5,
  cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingEqually,
  render: renderIconEdge,
});

fabric.Object.prototype.controls.br = new fabric.Control({
  x: 0.5,
  y: 0.5,
  cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
  actionHandler: fabric.controlsUtils.scalingEqually,
  render: renderIconEdge,
});

fabric.Object.prototype.controls.mtr = new fabric.Control({
  x: 0,
  y: 0.5,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  actionHandler: fabric.controlsUtils.rotationWithSnapping,
  offsetY: 30,
  withConnection: false,
  actionName: "rotate",
  render: renderIconRotate,
});

fabric.Textbox.prototype.controls.mtr = fabric.Object.prototype.controls.mtr;
fabric.Textbox.prototype.controls.tr = fabric.Object.prototype.controls.tr;
fabric.Textbox.prototype.controls.br = fabric.Object.prototype.controls.br;
fabric.Textbox.prototype.controls.tl = fabric.Object.prototype.controls.tl;
fabric.Textbox.prototype.controls.bl = fabric.Object.prototype.controls.bl;

fabric.Textbox.prototype.controls.mt = new fabric.Control({
  visible: false,
});

fabric.Textbox.prototype.controls.mb = new fabric.Control({
  visible: false,
});

fabric.Textbox.prototype.controls.ml = new fabric.Control({
  x: -0.5,
  y: 0,
  offsetX: -1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.changeWidth,
  actionName: "resizing",
  render: renderIcon,
});

fabric.Textbox.prototype.controls.mr = new fabric.Control({
  x: 0.5,
  y: 0,
  offsetX: 1,
  cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.changeWidth,
  actionName: "resizing",
  render: renderIcon,
});

fabric.Cropper = fabric.util.createClass(fabric.Rect, {
  lockRotation: true,
  controls: {
    mt: fabric.Object.prototype.controls.mt,
    mb: fabric.Object.prototype.controls.mb,
    ml: fabric.Object.prototype.controls.ml,
    mr: fabric.Object.prototype.controls.mr,
    tl: new fabric.Control({
      x: -0.5,
      y: -0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconCrop(0),
    }),
    tr: new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconCrop(90),
    }),
    bl: new fabric.Control({
      x: -0.5,
      y: 0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconCrop(270),
    }),
    br: new fabric.Control({
      x: 0.5,
      y: 0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconCrop(180),
    }),
  },
});

fabric.Canvas.prototype.getItemByName = function (name) {
  let object: fabric.Object | null = null;
  const objects = this.getObjects();
  for (let i = 0, len = this.size(); i < len; i++) {
    if (objects[i].get("type") == "group") {
      if (objects[i].get("name") && objects[i].get("name") === name) {
        object = objects[i];
        break;
      }
      const wip = i;
      for (let o = 0; o < (objects[i] as fabric.Group)._objects.length; o++) {
        if ((objects[wip] as fabric.Group)._objects[o].name && (objects[wip] as fabric.Group)._objects[o].name === name) {
          object = (objects[wip] as fabric.Group)._objects[o];
          break;
        }
      }
    } else if (objects[i].name && objects[i].name === name) {
      object = objects[i];
      break;
    }
  }
  return object;
};

fabric.Object.NUM_FRACTION_DIGITS = 5;

fabric.Object.prototype.set({
  transparentCorners: false,
  borderColor: "#2563EB",
  cornerColor: "#FFFFFF",
  borderScaleFactor: 2.5,
  cornerStyle: "circle",
  cornerStrokeColor: "#2563EB",
  borderOpacityWhenMoving: 1,
  strokeUniform: true,
});
