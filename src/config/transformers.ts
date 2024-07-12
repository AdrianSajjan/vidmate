import { env } from "@xenova/transformers";

env.allowLocalModels = false;
env.backends.onnx.wasm.proxy = true;
