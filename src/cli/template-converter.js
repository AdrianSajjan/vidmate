import path from "path";
import fs from "fs/promises";

import { fileURLToPath } from "url";
import { nanoid, customAlphabet } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

const dataMapping = {
  name: "a",
  notes: "b",
  layers: "c",
  ROOT: "d",
  type: "e",
  resolvedName: "f",
  props: "g",
  boxSize: "h",
  width: "i",
  height: "j",
  position: "k",
  x: "l",
  y: "m",
  rotate: "n",
  color: "o",
  image: "p",
  gradientBackground: "q",
  locked: "r",
  child: "s",
  parent: "t",
  scale: "u",
  text: "v",
  fonts: "w",
  family: "x",
  url: "y",
  style: "z",
  styles: "aa",
  colors: "ab",
  fontSizes: "ac",
  effect: "ad",
  settings: "ae",
  thickness: "af",
  transparency: "ag",
  clipPath: "ah",
  shapeSize: "ai",
  thumb: "aj",
  offset: "ak",
  direction: "al",
  blur: "am",
  border: "an",
  weight: "ao",
  resolvedType: "ap",
};

function createPath(path, props) {
  return {
    type: "path",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    fill: "#000000",
    stroke: null,
    strokeWidth: 1,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeUniform: true,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "stroke",
    globalCompositeOperation: "source-over",
    skewX: 0,
    skewY: 0,
    erasable: true,
    name: elementID("shape"),
    meta: {
      duration: 10000,
      offset: 0,
    },
    anim: {
      in: {
        name: "none",
        duration: 0,
      },
      scene: {
        name: "none",
      },
      out: {
        name: "none",
        duration: 0,
      },
    },
    selectable: true,
    evented: true,
    hasControls: true,
    absolutePositioned: false,
    path: path,
    ...props,
  };
}

function createImage(src, props) {
  return {
    type: "image",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    fill: "rgb(0,0,0)",
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeUniform: true,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "stroke",
    globalCompositeOperation: "source-over",
    skewX: 0,
    skewY: 0,
    erasable: true,
    cropX: 0,
    cropY: 0,
    name: elementID("image"),
    meta: {
      duration: 10000,
      offset: 0,
    },
    anim: {
      in: {
        name: "none",
        duration: 0,
      },
      scene: {
        name: "rotate",
        duration: 3000,
        easing: "linear",
      },
      out: {
        name: "none",
        duration: 0,
      },
    },
    effects: {},
    adjustments: {},
    selectable: true,
    evented: true,
    hasControls: true,
    absolutePositioned: false,
    src: src,
    crossOrigin: "anonymous",
    filters: [],
    ...props,
  };
}

function createTextbox(text, props) {
  return {
    type: "textbox",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
    width: 500,
    fill: "#ffffff",
    stroke: null,
    strokeWidth: 1,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeUniform: true,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "stroke",
    globalCompositeOperation: "source-over",
    skewX: 0,
    skewY: 0,
    erasable: true,
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 64,
    text: text,
    underline: false,
    overline: false,
    linethrough: false,
    textAlign: "left",
    fontStyle: "normal",
    lineHeight: 1.16,
    textBackgroundColor: "",
    charSpacing: 5,
    styles: [],
    direction: "ltr",
    path: null,
    pathStartOffset: 0,
    pathSide: "left",
    pathAlign: "baseline",
    minWidth: 20,
    splitByGrapheme: false,
    name: elementID("text"),
    meta: {
      duration: 10000,
      offset: 0,
    },
    anim: {
      in: {
        name: "none",
        duration: 0,
      },
      scene: {
        name: "none",
      },
      out: {
        name: "none",
        duration: 0,
      },
    },
    selectable: true,
    evented: true,
    hasControls: true,
    absolutePositioned: false,
    ...props,
  };
}

function elementID(prefix) {
  return prefix.toLowerCase() + "_" + __nanoid(4);
}

function unpack(packed) {
  if (!packed) return packed;
  if (Array.isArray(packed)) {
    const unpackedArray = [];
    for (let i = 0; i < packed.length; i++) {
      unpackedArray.push(unpack(packed[i]));
    }
    return unpackedArray;
  }
  if (typeof packed === "object") {
    const unpackedObj = {};
    for (const key in packed) {
      if (packed.hasOwnProperty(key)) {
        const originalKey = Object.keys(dataMapping).find((k) => dataMapping[k] === key) || key;
        unpackedObj[originalKey] = unpack(packed[key]);
      }
    }
    return unpackedObj;
  }
  return packed;
}

function convertLayer() {
  switch (layer.type.resolvedName) {
    case "ImageLayer":
      const image = createImage(layer.props.image.url, {
        top: layer.props.position.y,
        left: layer.props.position.x,
        height: layer.props.boxSize.height,
        width: layer.props.boxSize.width,
      });
      return image;
    case "TextLayer":
      const textbox = createTextbox();
      return textbox;
  }
}

function convertLayers(template) {
  const root = template.layers.ROOT.props;
  const data = { version: "5.3.0", objects: [], background: "#F0F0F0" };
  const result = { height: root.boxSize.height || 1080, width: root.boxSize.width || 1080, fill: root.color || "#FFFFFF", data: data };
  for (const [key, layer] of Object.entries(template.layers)) {
    if (key === "ROOT") continue;
    data.objects.push(convertLayer(layer));
  }
  return result;
}

function mapPages(template) {
  const unpacked = unpack(JSON.parse(template.data));
  if (Array.isArray(unpacked)) {
    return unpacked.map((data, index) => {
      return { id: nanoid(), name: "Untitled Page", thumbnail: template.thumbnails[index].url, duration: 5, ...convertLayers(data) };
    });
  } else {
    return Array({ id: nanoid(), name: "Untitled Page", thumbnail: template.thumbnails[0].url, duration: 5, ...convertLayers(unpacked) });
  }
}

function mapTemplates(template) {
  return { id: nanoid(), name: template.desc, pages: mapPages(template) };
}

async function templateConverter() {
  try {
    const buffer = await fs.readFile(path.resolve(__dirname, process.argv[2]));
    const json = JSON.parse(buffer);
    const result = json.map(mapTemplates);
    fs.writeFile(path.resolve(__dirname, "converted-" + process.argv[2]), JSON.stringify(result, undefined, 2), "utf-8");
  } catch (error) {
    console.log("---ERROR----");
    console.log(error);
  }
}

templateConverter();

// Template Page
// id: string; -
// name: string; -
// data: string; -> template data
// fill: string;
// width: number;
// height: number;
// thumbnail: string; -
// duration: number; -
