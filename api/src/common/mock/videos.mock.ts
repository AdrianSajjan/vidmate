import { Video } from '@app/common/types/ads';

export const videos: Video[] = [
  {
    name: 'man-running-on-a-trail',
    url: 'http://localhost:3000/videos/running.mp4',
    meta: {
      tags: ['running', 'shoes', 'trail', 'hill'],
      audios: [
        {
          name: 'rock-beat-rythm',
          url: 'http://localhost:3000/audios/178420.mp3',
        },
      ],
    },
  },
];
