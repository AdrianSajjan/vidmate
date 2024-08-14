import { editor } from "@/context/editor";
import { compressImageFile, compressVideoFile } from "@/lib/media";
import { createInstance, createPromise, wait } from "@/lib/utils";

export async function uploadAssetToS3(file: File, type?: "image" | "video" | "audio" | "thumbnail") {
  switch (type) {
    case "image": {
      const compressed = await compressImageFile(file);
      return URL.createObjectURL(compressed);
    }
    case "video": {
      const compressed = await compressVideoFile(editor.ffmpeg, file);
      return URL.createObjectURL(compressed);
    }
    default:
      await wait(1000);
      return URL.createObjectURL(file);
  }
}

export async function readAssetAsDataURL(file: File) {
  return createPromise<string>((resolve, reject) => {
    const reader = createInstance(FileReader);
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject());
    reader.readAsDataURL(file);
  });
}
