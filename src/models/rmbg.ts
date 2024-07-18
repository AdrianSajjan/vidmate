import { createInstance, createMap, createPromise } from "@/lib/utils";
import { makeAutoObservable } from "mobx";
import { AutoModel, AutoProcessor, PreTrainedModel, Processor, RawImage } from "@xenova/transformers";

type CacheUsage = "original" | "modified";

interface RmbgAICache {
  original: string;
  modified: string;
  usage: CacheUsage;
}

interface ModelResponse {
  output: any;
}

interface ProcessorResponse {
  pixel_values: any;
}

interface InitializationResponse {
  model: PreTrainedModel;
  processor: Processor;
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

export class RmbgAI {
  cache: Map<string, RmbgAICache>;
  pending: Map<string, boolean>;

  constructor() {
    this.cache = createMap<string, RmbgAICache>();
    this.pending = createMap<string, boolean>();
    makeAutoObservable(this);
  }

  private *_initialize() {
    const model: PreTrainedModel = yield AutoModel.from_pretrained("RMBG-1.4");
    const processor: Processor = yield AutoProcessor.from_pretrained("RMBG-1.4", { config });
    return { model, processor };
  }

  *removeBackground(url: string, id: string) {
    try {
      this.pending.set(id, true);
      const initialize: InitializationResponse = yield this._initialize();

      const image: RawImage = yield RawImage.fromURL(url);
      const processed: ProcessorResponse = yield initialize.processor(image);

      const data: ModelResponse = yield initialize.model({ input: processed.pixel_values });
      const mask: RawImage = yield RawImage.fromTensor(data.output[0].mul(255).to("uint8")).resize(image.width, image.height);

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;

      context.drawImage(image.toCanvas(), 0, 0);
      const pixels = context.getImageData(0, 0, image.width, image.height);

      for (let i = 0; i < mask.data.length; ++i) pixels.data[4 * i + 3] = mask.data[i];
      context.putImageData(pixels, 0, 0);

      return createPromise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject();
          resolve(blob);
        });
      });
    } finally {
      this.pending.delete(id);
    }
  }

  addCacheEntry(id: string, original: string, modified: string, usage: CacheUsage) {
    this.cache.set(id, { original, modified, usage });
  }

  updateCacheEntry(id: string, data: Partial<RmbgAICache>) {
    const entry = this.cache.get(id);
    if (!entry) return;
    this.cache.set(id, { ...entry, ...data });
  }

  removeCacheEntry(id: string) {
    this.cache.delete(id);
  }

  initializeCache(entries: [string, RmbgAICache][]) {
    this.cache = createMap(entries);
  }

  exportCache() {
    return Array.from(this.cache.entries());
  }
}

export const rmbgAI = createInstance(RmbgAI);
