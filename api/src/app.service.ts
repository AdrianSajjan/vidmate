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
      const name = path.join(__dirname, '..', 'uploads', 'audio', file);
      (async () => {
        try {
          const audio = await this.elevanlabsClient.generate({
            voice: 'Rachel',
            model_id: 'eleven_turbo_v2_5',
            text,
          });
          const buffer: Uint8Array[] = [];
          const stream = new WritableStream({
            write(chunk) {
              buffer.push(chunk);
            },
            close() {
              const data = Buffer.concat(buffer);
              fs.writeFileSync(name, data);
              subscriber.next(name);
              subscriber.complete();
            },
            abort() {
              subscriber.error();
            },
          });
          fs.createWriteStream(name);
          // @ts-expect-error To be fixed in elevenlabs SDK
          audio.pipeTo(stream);
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }
}
