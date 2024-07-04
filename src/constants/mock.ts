interface EditorMedia {
  source: string;
  thumbnail: string;
}

export const images: EditorMedia[] = [
  {
    source: "https://images.unsplash.com/photo-1558383331-f520f2888351?q=100&w=1080&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1558383331-f520f2888351?q=75&w=256&auto=format",
  },
  {
    source: "https://plus.unsplash.com/premium_photo-1710119487743-48959c984d45?q=100&w=1080&auto=format",
    thumbnail: "https://plus.unsplash.com/premium_photo-1710119487743-48959c984d45?q=75&w=256&auto=format",
  },
];

export const videos: EditorMedia[] = [
  {
    source: "https://cdn.img.ly/assets/demo/v2/ly.img.video/videos/pexels-drone-footage-of-a-surfer-barrelling-a-wave-12715991.mp4",
    thumbnail: "https://cdn.img.ly/assets/demo/v2/ly.img.video/thumbnails/pexels-drone-footage-of-a-surfer-barrelling-a-wave-12715991.jpg",
  },
];

export const audios = [];
