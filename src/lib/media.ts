import { createInstance } from "@/lib/utils";

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
