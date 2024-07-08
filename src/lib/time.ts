export function formatVideoDuration(duration: number) {
  let milliseconds: number | string = Math.floor(duration % 1000);
  let seconds: number | string = Math.floor((duration / 1000) % 60);
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60);

  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds + "." + String(milliseconds).substring(0, 1);
}
