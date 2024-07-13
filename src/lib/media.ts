import { createInstance, createPromise } from "@/lib/utils";

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
  });
}

export async function extractThumbnailFromVideoURL(url: string) {
  return createInstance(Promise<string>, (resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.currentTime = 0.5;
    video.addEventListener("loadeddata", () => {
      video.height = video.videoHeight;
      video.width = video.videoWidth;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject();
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    });
    video.addEventListener("error", () => {
      reject();
    });
    video.src = url;
  });
}

interface AudioWaveform {
  thumbnail: string;
  duration: number;
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
  return createInstance(Promise<string>, (resolve, reject) => {
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
      const url = URL.createObjectURL(blob);
      resolve(url);
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

  for (i = 0; i < _buffer.numberOfChannels; i++) channels.push(_buffer.getChannelData(i));

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
