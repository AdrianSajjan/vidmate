import * as path from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';

import { from, Observable } from 'rxjs';
import { ElevenLabsClient } from 'elevenlabs';
import { Injectable } from '@nestjs/common';

import { CreateSpeechFromTextDTO } from '@app/speech/dto/create-speech.dto';
import { formatMediaURL } from '@app/common/libs/utils';
import { Speech } from '@app/common/types/ads';

@Injectable()
export class SpeechService {
  constructor(private readonly elevanlabsClient: ElevenLabsClient) {}

  createSpeechFromText(body: CreateSpeechFromTextDTO) {
    return new Observable<Speech>((subscriber) => {
      const voice = body.voice || 'Brian';
      from(
        this.elevanlabsClient.generate({
          voice: voice,
          model_id: body.model || 'eleven_turbo_v2_5',
          text: body.text,
        }),
      ).subscribe({
        next(audio) {
          const file = uuid.v4() + '.mp3';
          const name = path.join(__dirname, '..', '..', 'uploads', 'speech', file);

          const buffer: Uint8Array[] = [];
          const stream = new WritableStream<Uint8Array>({
            write(chunk) {
              buffer.push(chunk);
            },
            close() {
              const data = Buffer.concat(buffer);
              fs.writeFileSync(name, data);
              subscriber.next({ gender: 'male', url: formatMediaURL(name), subtitle: body.text, voice: voice });
              subscriber.complete();
            },
            abort() {
              subscriber.error();
            },
          });

          // @ts-expect-error To be fixed in elevenlabs SDK
          audio.pipeTo(stream);
        },
        error(error) {
          subscriber.error(error);
        },
      });
    });
  }
}
