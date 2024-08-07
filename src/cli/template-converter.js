import path from "path";
import fs from "fs/promises";
import probe from "probe-image-size";

import { Parser } from "htmlparser2";
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
        name: "none",
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

function createTextbox(text, props, meta) {
  return {
    type: "textbox",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
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
    fontFamily: "Poppins",
    fontWeight: 400,
    fontSize: 48,
    text: text,
    underline: false,
    overline: false,
    linethrough: false,
    textAlign: "left",
    fontStyle: "normal",
    lineHeight: 1.16,
    textBackgroundColor: "",
    charSpacing: 0,
    styles: [],
    direction: "ltr",
    path: null,
    pathStartOffset: 0,
    pathSide: "left",
    pathAlign: "baseline",
    splitByGrapheme: false,
    name: elementID("text"),
    meta: {
      duration: 10000,
      offset: 0,
      font: {
        family: "Poppins",
        styles: [
          { name: "Poppins Regular", weight: "400", style: "normal" },
          { name: "Poppins Bold 700", weight: "700", style: "normal" },
        ],
      },
      ...(meta || {}),
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

function parseStyles(styles) {
  const style = {};
  const rules = styles
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => rule);
  rules.forEach((rule) => {
    const [property, value] = rule.split(":").map((item) => item.trim());
    if (property && value) {
      const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      style[camelCaseProperty] = value;
    }
  });
  return style;
}

function parseFonts(fonts) {
  const font = fonts?.at(0);
  if (!fonts || !font) {
    return {
      family: "Poppins",
      styles: [
        { name: "Poppins Regular", weight: "400", style: "normal" },
        { name: "Poppins Bold 700", weight: "700", style: "normal" },
      ],
    };
  } else if (font.family === "Canva Sans") {
    return {
      family: "Alexandria",
      styles: [
        { name: "Alexandria Regular", weight: "400", style: "normal" },
        { name: "Alexandria Bold 700", weight: "700", style: "normal" },
      ],
    };
  } else {
    return {
      family: font.family,
      styles: [
        { name: `${font.family} Regular`, weight: "400", style: "normal" },
        { name: `${font.family} Bold 700`, weight: "700", style: "normal" },
      ],
    };
  }
}

function extractTextContent(element) {
  let styles = [];
  let text = "";
  const parser = new Parser({
    onopentag(_, attrs) {
      if (attrs.style) styles.push(parseStyles(attrs.style));
    },
    ontext(content) {
      text += content;
    },
    onerror(error) {
      console.log(error);
    },
  });
  parser.write(element);
  parser.end();
  return { text, styles };
}

async function convertLayer(layer) {
  switch (layer.type.resolvedName) {
    case "ImageLayer": {
      const dimensions = await probe(layer.props.image.url);
      const image = createImage(layer.props.image.url, {
        top: layer.props.position.y,
        left: layer.props.position.x,
        height: dimensions.height,
        width: dimensions.width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        scaleX: layer.props.image.boxSize.width / dimensions.width,
        scaleY: layer.props.image.boxSize.height / dimensions.height,
      });
      return image;
    }
    case "TextLayer": {
      const content = extractTextContent(layer.props.text);
      const styles = content.styles[0];
      const font = parseFonts(layer.props.fonts);
      const textbox = createTextbox(
        content.text,
        {
          top: layer.props.position.y,
          left: layer.props.position.x,
          width: layer.props.boxSize.width,
          angle: layer.props.rotate,
          opacity: layer.props.transparency,
          lineHeight: styles?.lineHeight || 1.16,
          textAlign: styles?.textAlign || "center",
          textTransform: styles?.textTransform || "none",
          fontWeight: styles?.fontWeight || 400,
          fill: styles?.color || layer.props.colors[0],
          fontFamily: font.family,
          fontSize: Math.round(layer.props.fontSizes[0] * layer.props.scale),
        },
        {
          font: font,
        },
      );
      return textbox;
    }
    case "ShapeLayer": {
      const shape = createPath(layer.props.clipPath, {
        strokeWidth: layer.props.border?.weight,
        stroke: layer.props.border?.color,
        scaleX: layer.props.boxSize.width / +layer.props.shapeSize.width,
        scaleY: layer.props.boxSize.height / +layer.props.shapeSize.height,
        fill: layer.props.color || "",
        height: +layer.props.shapeSize.height,
        width: +layer.props.shapeSize.width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        top: layer.props.position.y,
        left: layer.props.position.x,
      });
      return shape;
    }
    case "FrameLayer": {
      let frame = null;
      const dimensions = await probe(layer.props.image.url);
      if (layer.props.border) {
        frame = createPath(layer.props.clipPath, {
          strokeWidth: layer.props.border.weight,
          stroke: layer.props.border.color,
          scaleX: layer.props.scale,
          scaleY: layer.props.scale,
          fill: layer.props.border.color || "",
          height: layer.props.boxSize.height,
          width: layer.props.boxSize.width,
          opacity: layer.props.transparency,
          angle: layer.props.rotate,
          top: layer.props.position.y,
          left: layer.props.position.x,
        });
      }
      const clipPath = createPath(layer.props.clipPath, {
        scaleX: layer.props.scale,
        scaleY: layer.props.scale,
        height: layer.props.boxSize.height,
        width: layer.props.boxSize.width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        top: layer.props.position.y,
        left: layer.props.position.x,
        opacity: 0.01,
        excludeFromAlignment: true,
        excludeFromTimeline: true,
        absolutePositioned: true,
        selectable: false,
        evented: false,
      });
      const image = createImage(layer.props.image.url, {
        top: layer.props.position.y,
        left: layer.props.position.x,
        height: dimensions.height,
        width: dimensions.width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        scaleX: layer.props.boxSize.width / dimensions.width,
        scaleY: layer.props.boxSize.height / dimensions.height,
        clipPath: clipPath,
      });
      return [frame, image].filter(Boolean);
    }
  }
}

async function convertLayers(template) {
  const root = template.layers.ROOT.props;
  const scene = { version: "5.3.0", objects: [], background: "#F0F0F0" };
  const data = { height: root.boxSize.height || 1080, width: root.boxSize.width || 1080, fill: root.color || "#FFFFFF", audios: [], scene: "" };
  for (const [key, layer] of Object.entries(template.layers)) {
    const converted = await convertLayer(layer);
    if (key === "ROOT" || !converted) continue;
    if (Array.isArray(converted)) scene.objects.push(...converted);
    else scene.objects.push(converted);
  }
  data.scene = JSON.stringify(scene);
  return data;
}

async function convertPage(layers, thumbnail) {
  const data = await convertLayers(layers);
  return { id: nanoid(), name: "Untitled Page", thumbnail: thumbnail.url, duration: 10000, data: data };
}

async function convertPages(template) {
  const unpacked = unpack(JSON.parse(template.data));
  if (Array.isArray(unpacked)) {
    const result = [];
    for (let index = 0; index < unpacked.length; index++) {
      const page = await convertPage(unpacked[index], template.thumbnails[index]);
      result.push(page);
    }
    return result;
  } else {
    const page = await convertPage(unpacked, template.thumbnails[0]);
    return Array(page);
  }
}

async function templateConverter() {
  try {
    const buffer = await fs.readFile(path.resolve(__dirname, process.argv[2]));
    const json = JSON.parse(buffer);
    const result = [];
    for (const template of json) {
      const pages = await convertPages(template);
      result.push({ id: nanoid(), name: template.desc, pages: pages });
    }
    fs.writeFile(path.resolve(__dirname, "converted-" + process.argv[2]), JSON.stringify(result, undefined, 2), "utf-8");
  } catch (error) {
    console.log("---ERROR----");
    console.log(error);
  }
}

templateConverter();
