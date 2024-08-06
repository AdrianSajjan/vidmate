import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

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

function mapPages(template) {
  const unpacked = unpack(JSON.parse(template.data));
  if (Array.isArray(unpacked)) {
    return unpacked.map((data, index) => {
      return {
        id: nanoid(),
        name: "Untitled Page",
        data: data,
        thumbnail: template.thumbnails[index].url,
      };
    });
  } else {
    return [
      {
        id: nanoid(),
        name: "Untitled Page",
        data: unpacked,
        thumbnail: template.thumbnails[0].url,
      },
    ];
  }
}

function mapTemplates(template) {
  return {
    id: nanoid(),
    name: template.desc,
    pages: mapPages(template),
  };
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

function rect(props) {
  return {
    type: "rect",
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
    rx: 0,
    ry: 0,
    name: __nanoid("rect"),
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

function image(src, props) {
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
    name: "image_xycz",
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

// Template Page
// id: string;
// name: string;
// data: string; -> template data
// fill: string;
// width: number;
// height: number;
// thumbnail: string;
// duration: number;
