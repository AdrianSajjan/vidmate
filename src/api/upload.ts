import { nanoid } from "nanoid";
import { api } from "@/config/api";
import { editor } from "@/context/editor";
import { compressImageFile, compressVideoFile, extractAudioWaveformFromAudioFile, extractThumbnailFromImage, extractThumbnailFromVideo } from "@/lib/media";
import { createFormData, createInstance, createPromise } from "@/lib/utils";

export interface UploadAsset {
  name?: string;
  source: string;
  duration?: number;
  thumbnail: string;
}

async function upload(file: File | Blob, name: string): Promise<string> {
  const response = await api.post("/engine/ads/api/v1/upload_template_S3", createFormData({ template_file: file }, { template_file: name }));
  return response.data.url;
}

export async function uploadAssetToS3(file: File, type: "image" | "video" | "audio" | "thumbnail"): Promise<UploadAsset> {
  const id = nanoid();
  const thumbname = id + ".png";
  const filename = id + file.name.split(".").pop();

  switch (type) {
    case "image": {
      const files = await Promise.all([compressImageFile(file), extractThumbnailFromImage(file)]);
      const [source, thumbnail] = await Promise.all([upload(files[0], filename), upload(files[1], thumbname)]);
      return { source, thumbnail, name: file.name };
    }

    case "video": {
      const files = await Promise.all([compressVideoFile(editor.ffmpeg, file), extractThumbnailFromVideo(file)]);
      const [source, thumbnail] = await Promise.all([upload(files[0], filename), upload(files[1], thumbname)]);
      return { source, thumbnail, name: file.name };
    }

    case "audio": {
      const [source, { duration, thumbnail }] = await Promise.all([
        upload(file, filename),
        extractAudioWaveformFromAudioFile(file).then((waveform) => upload(waveform.thumbnail, thumbname).then((thumbnail) => ({ thumbnail, duration: waveform.duration }))),
      ]);
      return { source, duration, thumbnail, name: file.name };
    }

    case "thumbnail": {
      const thumbnail = await upload(file, thumbname);
      return { source: thumbnail, thumbnail: thumbnail, name: file.name };
    }

    default:
      throw createInstance(Error, "The provided asset type is not valid!");
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
