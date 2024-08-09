import { fabric } from "fabric";

const _initialize = fabric.Object.prototype.initialize;
const _render = fabric.Object.prototype.render;

fabric.Object.prototype.initialize = function (options) {
  _initialize.apply(this, [options]);
  this.blur = options?.blur;
  return this;
};

fabric.Object.prototype.render = function (ctx) {
  ctx.save();
  if (!!this.blur) ctx.filter = `blur(${this.blur}px)`;
  _render.apply(this, [ctx]);
  ctx.restore();
};
