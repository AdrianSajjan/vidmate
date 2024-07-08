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
    const canvas = document.createElement("canvas");
    const context = createInstance(AudioContext);
    const reader = createInstance(FileReader);
    reader.addEventListener("load", () => {
      const result = reader.result as ArrayBuffer;
      context.decodeAudioData(result, (buffer) => {
        const raw = buffer.getChannelData(0);
        const ctx = canvas.getContext("2d")!;
        canvas.height = canvas.width = 320;
        const step = Math.ceil(raw.length / canvas.width);
        const amp = canvas.height / 2;
        for (let i = 0; i < canvas.width; i++) {
          const min = 1.0 - Math.max(...raw.subarray(i * step, (i + 1) * step));
          const max = 1.0 - Math.min(...raw.subarray(i * step, (i + 1) * step));
          ctx.fillStyle = "black";
          ctx.fillRect(i, min * amp, 1, (max - min) * amp);
        }
        canvas.toBlob((blob) => {
          if (!blob) return reject();
          const url = URL.createObjectURL(blob);
          resolve({ thumbnail: url, duration: buffer.duration });
        });
      });
    });
    reader.readAsArrayBuffer(file);
  });
}
