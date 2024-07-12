import { env } from "@xenova/transformers";

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.backends.onnx.wasm.proxy = true;
