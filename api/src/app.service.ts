import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ElevenLabsClient } from 'elevenlabs';

@Injectable()
export class AppService {
  constructor(private readonly elevanlabsClient: ElevenLabsClient) {}

  createAudioFileFromText(text: string) {
    return new Observable<string>((subscriber) => {
      const id = uuid.v4();
      const file = `${id}.mp3`;
      console.log(path);
      const name = path.join(__dirname, 'uploads', 'audio', file);
      const stream = fs.createWriteStream(name);
      (async () => {
        try {
          const audio = await this.elevanlabsClient.generate({
            voice: 'Rachel',
            model_id: 'eleven_turbo_v2_5',
            text,
          });
          audio.pipe(stream);
          stream.on('finish', () => {
            subscriber.next(name);
            subscriber.complete();
          });
          stream.on('error', () => subscriber.error());
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }
}
