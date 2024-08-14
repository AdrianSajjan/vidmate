import { compressImageFile } from "@/lib/media";
import { createInstance, createPromise, wait } from "@/lib/utils";

export async function uploadAssetToS3(file: File, type?: "image" | "video" | "audio") {
  await wait(1000);
  switch (type) {
    case "image":
      const compressed = await compressImageFile(file);
      return URL.createObjectURL(compressed);
    default:
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
