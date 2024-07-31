import { createInstance, createPromise, wait } from "@/lib/utils";

export async function uploadAssetToS3(file: File, _?: string) {
  await wait(1000);
  return URL.createObjectURL(file);
}

export async function readAssetAsDataURL(file: File) {
  return createPromise<string>((resolve, reject) => {
    const reader = createInstance(FileReader);
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject());
    reader.readAsDataURL(file);
  });
}
