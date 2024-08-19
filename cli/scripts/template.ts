import { openAsBlob } from "node:fs";
import * as path from "node:path";
import * as fs from "node:fs/promises";

import sharp from "sharp";
import { fetch, FormData, File } from "undici";
import { Parser } from "htmlparser2";
import { customAlphabet } from "nanoid";

type ElementStyles = Record<string, any>;

interface EditorTemplate {
  id: string;
  name: string;
  pages: EditorTemplatePage[];
}

interface EditorTemplatePageData {
  scene: string;
  audios: Omit<EditorAudioElement, "buffer" | "source">[];
  fill: string;
  width: number;
  height: number;
}

interface EditorTemplatePage {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  data: EditorTemplatePageData;
}

interface EditorAudioElement {
  id: string;
  url: string;
  name: string;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  volume: number;
  muted: boolean;
  duration: number;
  offset: number;
  playing: boolean;
  trim: number;
  timeline: number;
}

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");
const maxHeight = 1080;
const maxWidth = 1080;

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
    fontFamily: "Inter",
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
        family: "Inter",
        styles: [
          { name: "Inter Regular", weight: "400", style: "normal" },
          { name: "Inter Bold 700", weight: "700", style: "normal" },
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
  return prefix.toLowerCase() + "_" + nanoid(4);
}

function unpack(packed) {
  if (!packed) return packed;
  if (Array.isArray(packed)) {
    const unpackedArray: any[] = [];
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

function parseStyles(styles: string) {
  const style: ElementStyles = {};
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
      family: "Inter",
      styles: [
        { name: "Inter Regular", weight: "400", style: "normal" },
        { name: "Inter Bold 700", weight: "700", style: "normal" },
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
  let styles: Array<ElementStyles> = [];
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

async function resizeImage(url: string) {
  const id = nanoid();

  const input = path.join(__dirname, "..", "assets", id + "_input" + ".png");
  const output = path.join(__dirname, "..", "assets", id + "_output" + ".png");

  try {
    const response = await fetch(url).then((response) => response.arrayBuffer());
    await fs.writeFile(input, new Uint8Array(response));

    const metadata = await sharp(input).metadata();
    const imageWidth = metadata.width;
    const imageHeight = metadata.height;

    if (!imageWidth || !imageHeight) {
      console.warn("Error: No image metadata found");
      return { url, width: imageWidth || maxWidth, height: imageHeight || maxHeight };
    }

    if (imageWidth > maxWidth || imageHeight > maxHeight) {
      const resized = await sharp(input).resize(maxWidth, maxHeight, { fit: "inside" }).toFile(output);
      const blob = await openAsBlob(output, { type: "image/png" });

      const body = new FormData();
      body.append("template_file", blob, id + ".png");

      const response = await fetch("https://qa.zocket.com/engine/ads/api/v1/upload_template_S3", { method: "POST", body: body });
      if (response.status !== 200) throw new Error("Error: Failed to upload downscaled image");

      const uploaded: any = await response.json();
      console.log("Image downscaled successfully");
      return { url: uploaded.url, width: resized.width, height: resized.height };
    } else {
      console.warn("Image dimensions are within the specified limits; no downscaling needed.");
      return { url, width: imageWidth, height: imageHeight };
    }
  } catch (error: any) {
    console.error("Error downscaling image:", error.message);
    return { url, width: maxWidth, height: maxHeight };
  } finally {
    await fs.unlink(input).catch((error) => console.error("Error cleaning up temporary input file:", error.message));
    await fs.unlink(output).catch((error) => console.error("Error cleaning up temporary output file:", error.message));
  }
}

async function convertLayer(layer) {
  switch (layer.type.resolvedName) {
    case "ImageLayer": {
      const { height, width, url } = await resizeImage(layer.props.image.url);
      const image = createImage(url, {
        top: layer.props.position.y,
        left: layer.props.position.x,
        height: height,
        width: width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        scaleX: layer.props.image.boxSize.width / width!,
        scaleY: layer.props.image.boxSize.height / height!,
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
      const { height, url, width } = await resizeImage(layer.props.image.url);
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
      const image = createImage(url, {
        top: layer.props.position.y,
        left: layer.props.position.x,
        height: height,
        width: width,
        opacity: layer.props.transparency,
        angle: layer.props.rotate,
        scaleX: layer.props.boxSize.width / width,
        scaleY: layer.props.boxSize.height / height,
        clipPath: clipPath,
      });
      return [frame, image].filter(Boolean);
    }
  }
}

async function convertLayers(template) {
  const fill = template.layers.ROOT.props.color || "#FFFFFF";
  const width = Math.round(template.layers.ROOT.props.boxSize.width) || 1080;
  const height = Math.round(template.layers.ROOT.props.boxSize.height) || 1080;

  if (height !== 1080 || width !== 1080) {
    console.warn("Template dimensions are not 1080x1080. Skipping conversion.");
    return null;
  }

  const scene = { version: "5.3.0", objects: [] as fabric.Object[], background: "#F0F0F0" };
  const data = { height: height, width: width, fill: fill, audios: [], scene: "" };

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
  if (!data) return null;
  const result: EditorTemplatePage = { id: nanoid(), name: "Untitled Page", thumbnail: thumbnail, duration: 10000, data: data };
  return result;
}

async function convertPages(template: any) {
  const unpacked = unpack(JSON.parse(template.data));
  const result: EditorTemplatePage[] = [];
  const thumbnail = template.thumbnails.find((thumbnail) => thumbnail.aspectRatio === "square")?.url || template.img;
  if (Array.isArray(unpacked)) {
    for (let index = 0; index < unpacked.length; index++) {
      console.log("Coverting Page:", index + 1);
      const page = await convertPage(unpacked[index], thumbnail);
      if (page) result.push(page);
    }
  } else {
    console.log("Coverting Page:", 1);
    const page = await convertPage(unpacked, thumbnail);
    if (page) result.push(page);
  }
  return result;
}

async function templateConverter() {
  try {
    const buffer = await fs.readFile(path.resolve(__dirname, "..", "json", "templates.json"));
    const json = JSON.parse(String(buffer));
    const length = Math.min(json.length, 5);
    const result: EditorTemplate[] = [];
    for (let index = 0; index < length; index++) {
      console.log("Converting Template:", index + 1);
      const template = json[index];
      const pages = await convertPages(template);
      result.push({ id: nanoid(), name: template.desc, pages: pages.filter(Boolean) });
      console.log("Progress", ((index + 1) / length) * 100 + "%");
    }
    fs.writeFile(path.resolve(__dirname, "..", "database", "templates.json"), JSON.stringify(result, undefined, 2), "utf-8");
  } catch (error) {
    console.log("---ERROR----");
    console.log(error);
  }
}

templateConverter();
