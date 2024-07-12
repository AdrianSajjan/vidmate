import { createInstance, createMap, createPromise } from "@/lib/utils";
import { makeAutoObservable } from "mobx";
import { AutoModel, AutoProcessor, PreTrainedModel, Processor, RawImage } from "@xenova/transformers";

export interface BackgroundRemoverCache {
  original: string;
  modified: string;
}

interface ModelResponse {
  output: any;
}

interface ProcessorResponse {
  pixel_values: any;
}

const config = {
  do_normalize: true,
  do_pad: false,
  do_rescale: true,
  do_resize: true,
  image_mean: [0.5, 0.5, 0.5],
  feature_extractor_type: "ImageFeatureExtractor",
  image_std: [1, 1, 1],
  resample: 2,
  rescale_factor: 0.00392156862745098,
  size: { width: 1024, height: 1024 },
};

export class BackgroundRemover {
  initialized: "initialized" | "uninitialized" | "pending";
  status: "idle" | "pending" | "completed" | "rejected";

  model?: PreTrainedModel;
  processor?: Processor;
  cache: Map<string, BackgroundRemoverCache>;

  constructor() {
    this.status = "idle";
    this.initialized = "uninitialized";
    this.cache = createMap<string, BackgroundRemoverCache>();
    makeAutoObservable(this);
  }

  *onInitialize() {
    this.initialized = "pending";
    try {
      this.model = yield AutoModel.from_pretrained("RMBG-1.4");
      this.processor = yield AutoProcessor.from_pretrained("RMBG-1.4", { config });
      this.initialized = "initialized";
    } catch (error) {
      this.initialized = "uninitialized";
      throw error;
    }
  }

  *onRemoveBackground(url: string) {
    if (!this.model || !this.processor) throw createInstance(Error, "Plugin is not initialized yet");

    const image: RawImage = yield RawImage.fromURL(url);
    const processed: ProcessorResponse = yield this.processor(image);

    const data: ModelResponse = yield this.model({ input: processed.pixel_values });
    const mask: RawImage = yield RawImage.fromTensor(data.output[0].mul(255).to("uint8")).resize(image.width, image.height);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;

    context.drawImage(image.toCanvas(), 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height);

    for (let i = 0; i < mask.data.length; ++i) pixels.data[4 * i + 3] = mask.data[i];
    context.putImageData(pixels, 0, 0);

    const blob: Blob = yield createPromise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject();
        resolve(blob);
      });
    });

    return blob;
  }

  onCacheEntryAdd(id: string, original: string, modified: string) {
    this.cache.set(id, { original, modified });
  }

  onCacheEntryUpdate(id: string, modified: string) {
    const entry = this.cache.get(id);
    if (!entry) return;
    this.cache.set(id, { original: entry.original, modified });
  }

  onCacheEntryRemove(id: string) {
    this.cache.delete(id);
  }

  onInitializeCache(entries: [string, BackgroundRemoverCache][]) {
    this.cache = createMap(entries);
  }

  onExportCache() {
    return Array.from(this.cache.entries());
  }
}

export const backgroundRemover = createInstance(BackgroundRemover);
