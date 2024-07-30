import * as path from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';

import { from, Observable } from 'rxjs';
import { ElevenLabsClient } from 'elevenlabs';
import { Injectable } from '@nestjs/common';
import { CreateSpeechFromTextDTO } from '@app/voice/dto/create-voice.dto';

@Injectable()
export class VoiceService {
  constructor(private readonly elevanlabsClient: ElevenLabsClient) {}

  createAudioFileFromText(body: CreateSpeechFromTextDTO) {
    return new Observable<string>((subscriber) => {
      from(
        this.elevanlabsClient.generate({
          voice: body.voice || 'Brian',
          model_id: body.model || 'eleven_turbo_v2_5',
          text: body.text,
        }),
      ).subscribe({
        next(audio) {
          const file = `${uuid.v4()}.mp3`;
          const name = path.join(__dirname, '..', '..', 'uploads', 'voice', file);

          const buffer: Uint8Array[] = [];
          const stream = new WritableStream<Uint8Array>({
            write(chunk) {
              buffer.push(chunk);
            },
            close() {
              const data = Buffer.concat(buffer);
              fs.writeFileSync(name, data);
              subscriber.next(name.split('uploads').pop());
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
