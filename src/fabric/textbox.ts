import { fabric } from "fabric";

const Textbox = fabric.util.createClass(fabric.Textbox, {
  type: "textbox",

  initialize: function (text: string, options?: fabric.ITextboxOptions) {
    options = options || {};
    this.callSuper("initialize", text, options);
  },

  _splitTextIntoLines: function (_text: string) {
    const text = this._transformText(_text);
    return this.callSuper("_splitTextIntoLines", text);
  },

  _transformText: function (text: string) {
    switch (this.textTransform) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      default:
        return text;
    }
  },
});

Textbox.fromObject = fabric.Textbox.fromObject;
Textbox.fromElement = fabric.Textbox.fromElement;

fabric.Textbox = Textbox;
