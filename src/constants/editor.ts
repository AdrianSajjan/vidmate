export const fontSizes = [12, 14, 16, 18, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96];
export const presetDurations = [15, 30];

export const minZoom = 0.1;
export const maxZoom = 2.5;

export const darkHexCodes = ["#333333", "#1a1a80", "#4b2e2e", "#2e4b2e", "#444444", "#2c3e50", "#8b0000", "#2f4f4f", "#6a5acd", "#800080"];
export const lightHexCodes = ["#ffffff", "#cccccc", "#add8e6", "#ffffcc", "#ffb6c1", "#ff69b4", "#ffd700", "#98fb98", "#afeeee", "#d8bfd8"];
export const pastelHexCodes = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#E6E6FA", "#FFD1DC", "#D5E8D4", "#FFDAC1", "#F4C2C2"];

export const filterPlaceholder = "https://plus.unsplash.com/premium_photo-1710119487743-48959c984d45?q=75&w=265";

export const formats = [
  {
    name: "Social Feed",
    aspectRatio: 1 / 1,
    dimensions: { height: 1080, width: 1080 },
    preview: "https://img.ly/showcases/cesdk/cases/video-ui/page-formats/square.svg",
  },
  {
    name: "Story / Reel",
    dimensions: { height: 1920, width: 1080 },
    aspectRatio: 9 / 16,
    preview: "https://img.ly/showcases/cesdk/cases/video-ui/page-formats/portrait.svg",
  },
  {
    name: "Full HD 1080p",
    dimensions: { height: 1080, width: 1920 },
    aspectRatio: 16 / 9,
    preview: "https://img.ly/showcases/cesdk/cases/video-ui/page-formats/landscape.svg",
  },
  {
    name: "Logo",
    dimensions: { height: 500, width: 500 },
    aspectRatio: 1 / 1,
    preview: "https://img.ly/showcases/cesdk/cases/page-sizes/thumbnail-brochure.svg"
  },
  {
    name: "Flyer",
    dimensions: { height: 3507, width: 2480 },
    aspectRatio: 2480 / 3507,
    preview: "https://img.ly/showcases/cesdk/cases/page-sizes/thumbnail-flyer.svg",
  },
  {
    name: "Poster",
    dimensions: { height: 2229, width: 1587 },
    aspectRatio: 529 / 743,
    preview: "https://img.ly/showcases/cesdk/cases/page-sizes/thumbnail-poster.svg",
  },
  {
    name: "Facebook Post",
    dimensions: { height: 788, width: 940 },
    aspectRatio: 235 / 197,
    preview: "https://img.ly/showcases/cesdk/cases/page-sizes/thumbnail-fb-photo-post.svg",
  },
  {
    name: "Instagram Post",
    dimensions: { height: 1080, width: 1080 },
    aspectRatio: 1 / 1,
    preview: "https://img.ly/showcases/cesdk/cases/page-sizes/thumbnail-ig-profile.svg",
  },
];
