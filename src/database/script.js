import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function shapeConvertAdapter() {
  try {
    const buffer = await fs.readFile(path.resolve(__dirname, process.argv[2]));
    const json = JSON.parse(buffer);
    const result = json.map((data) => ({
      id: data._id["$oid"],
      name: data.desc.replace(/ /g, "-"),
      path: data.clipPath,
      height: data.height,
      width: data.width,
      thumbnail: data.img,
    }));
    fs.writeFile(path.resolve(__dirname, "converted-" + process.argv[2]), JSON.stringify(result, undefined, 2), "utf-8");
  } catch (error) {
    console.log("---ERROR----");
    console.log(error);
  }
}

shapeConvertAdapter();
