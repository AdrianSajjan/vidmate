export function formatMediaURL(path: string) {
  return 'http://localhost:3000' + path.split('uploads').pop();
}
