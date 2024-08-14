import { createInstance, createPromise } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { isString } from "lodash";
import { nanoid } from "nanoid";

interface AudioWaveform {
  thumbnail: Blob;
  duration: number;
}

export function checkForAudioInVideo(source: string) {
  const video = document.createElement("video");

  video.muted = true;
  video.crossOrigin = "anonymous";
  video.preload = "auto";

  return createPromise<boolean>((resolve, reject) => {
    video.addEventListener("error", reject);
    video.addEventListener("canplay", () => (video.currentTime = 0.99), { once: true });
    // @ts-ignore
    video.addEventListener("seeked", () => resolve(Boolean(video.mozHasAudio) || Boolean(video.webkitAudioDecodedByteCount) || Boolean(video.audioTracks?.length)), { once: true });
    video.src = source;
    video.load();
  });
}

export function extractAudioDurationFromSource(source: string) {
  return createPromise<number>((resolve, reject) => {
    const audio = createInstance(Audio);
    audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
    audio.addEventListener("error", () => reject);
    audio.src = source;
    audio.load();
  });
}

export async function extractThumbnailFromVideo(url: string | Blob) {
  const source = isString(url) ? url : URL.createObjectURL(url);
  return createInstance(Promise<Blob>, (resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.currentTime = 0.5;
    video.addEventListener("loadeddata", () => {
      video.height = video.videoHeight;
      video.width = video.videoWidth;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const compressed = recalculateImageSize(video, 256, 256);
      canvas.width = compressed.width;
      canvas.height = compressed.height;
      context.drawImage(video, 0, 0, compressed.width, compressed.height);
      canvas.toBlob((blob) => {
        if (isString(url)) URL.revokeObjectURL(source);
        if (!blob) return reject();
        resolve(blob);
      });
    });
    video.addEventListener("error", () => {
      if (isString(url)) URL.revokeObjectURL(source);
      reject();
    });
    video.src = source;
    video.load();
  });
}

export function extractThumbnailFromImage(url: string | Blob) {
  const source = isString(url) ? url : URL.createObjectURL(url);
  return createInstance(Promise<Blob>, (resolve, reject) => {
    const image = createInstance(Image);
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const { width, height } = recalculateImageSize(image, 256, 256);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (isString(url)) URL.revokeObjectURL(source);
        if (!blob) return reject();
        resolve(blob);
      });
    });
    image.addEventListener("error", () => {
      if (isString(url)) URL.revokeObjectURL(source);
      reject();
    });
    image.src = source;
  });
}

export async function extractAudioWaveformFromAudioFile(file: File) {
  return createInstance(Promise<AudioWaveform>, (resolve, reject) => {
    const context = createInstance(AudioContext);
    const reader = createInstance(FileReader);
    reader.addEventListener("load", async () => {
      const result = reader.result as ArrayBuffer;
      const buffer = await context.decodeAudioData(result);
      const wavefrom = await drawWavefromFromAudioBuffer(buffer);
      resolve({ thumbnail: wavefrom, duration: buffer.duration });
    });
    reader.addEventListener("error", () => {
      reject();
    });
    reader.readAsArrayBuffer(file);
  });
}

export async function drawWavefromFromAudioBuffer(buffer: AudioBuffer, height = 320, width = 320) {
  return createInstance(Promise<Blob>, (resolve, reject) => {
    const raw = buffer.getChannelData(0);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = height;
    canvas.width = width;
    const step = Math.ceil(raw.length / canvas.width);
    const amp = canvas.height / 2;
    for (let i = 0; i < canvas.width; i++) {
      const min = 1.0 - Math.max(...raw.subarray(i * step, (i + 1) * step));
      const max = 1.0 - Math.min(...raw.subarray(i * step, (i + 1) * step));
      context.fillStyle = "black";
      context.fillRect(i, min * amp, 1, (max - min) * amp);
    }
    canvas.toBlob((blob) => {
      if (!blob) return reject();
      resolve(blob);
    });
  });
}

export function dataURLToUInt8Array(dataURL: string) {
  const base64String = dataURL.split(",")[1];
  const binaryString = atob(base64String);
  const binaryLength = binaryString.length;
  const bytes = new Uint8Array(binaryLength);
  for (let i = 0; i < binaryLength; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function readableFileBytes(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export function recalculateImageSize(image: HTMLImageElement | HTMLVideoElement, maxWidth: number, maxHeight: number) {
  let width = image.width;
  let height = image.height;
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return { width, height };
}

export function compressImageFile(file: File, maxWidth = 2000, maxHeight = 2000) {
  return createPromise<Blob>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = createInstance(Image);
    image.addEventListener("load", () => {
      if (image.height <= maxHeight && image.width <= maxWidth) {
        URL.revokeObjectURL(source);
        return resolve(file);
      }
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const { width, height } = recalculateImageSize(image, maxWidth, maxHeight);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(source);
          if (!blob) return reject();
          resolve(blob);
        },
        "image/png",
        1,
      );
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(source);
      reject();
    });
    image.src = source;
  });
}

export async function fetchVideoDimensions(file: File) {
  return createInstance(Promise<{ width: number; height: number }>, (resolve, reject) => {
    const video = document.createElement("video");
    const source = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(source);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    });
    video.addEventListener("error", () => {
      URL.revokeObjectURL(source);
      reject();
    });
    video.src = source;
    video.load();
  });
}

export async function compressVideoFile(ffmpeg: FFmpeg, file: File, width = 2000, height = 2000) {
  const dimensions = await fetchVideoDimensions(file);
  if (dimensions.height <= height && dimensions.width <= width) return file;
  const input = await fetchFile(file);
  await ffmpeg.writeFile(file.name, input);
  const scale = height ? `scale=-1:${height}` : `scale=${width}:-1`;
  const output = nanoid() + ".mp4";
  await ffmpeg.exec(["-i", file.name, "-vf", scale, "-preset", "ultrafast", output]);
  const data = (await ffmpeg.readFile(output)) as Uint8Array;
  return createInstance(Blob, [data.buffer], { type: "video/mp4" });
}

export function convertBufferToWaveBlob(_buffer: AudioBuffer, _length: number) {
  let numOfChannels = _buffer.numberOfChannels;
  let length = _length * numOfChannels * 2 + 44;
  let buffer = createInstance(ArrayBuffer, length);
  let view = createInstance(DataView, buffer);
  let channels = [];
  let offset = 0;
  let pos = 0;
  let i, sample;
  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChannels);
  setUint32(_buffer.sampleRate);
  setUint32(_buffer.sampleRate * 2 * numOfChannels);
  setUint16(numOfChannels * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);
  for (i = 0; i < _buffer.numberOfChannels; i++) {
    channels.push(_buffer.getChannelData(i));
  }
  while (pos < length) {
    for (i = 0; i < numOfChannels; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7fff) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
  return createInstance(Blob, [buffer], { type: "audio/wav" });
}
