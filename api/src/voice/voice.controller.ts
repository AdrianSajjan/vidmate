import { Body, Controller, Post } from '@nestjs/common';
import { map } from 'rxjs';

import { VoiceService } from '@app/voice/voice.service';
import { SpeechFromTextDTO } from '@app/voice/data-access/speech-from-text.data-access';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('/text')
  generateSpeechFromText(@Body() body: SpeechFromTextDTO) {
    return this.voiceService.createAudioFileFromText(body).pipe(map((value) => ({ file: value })));
  }
}
