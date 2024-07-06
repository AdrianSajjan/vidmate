import { wait } from "@/lib/utils";

export async function uploadAssetToS3(file: File, _?: string) {
  await wait(1500);
  return URL.createObjectURL(file);
}
