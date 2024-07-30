import { Body, Controller, Post } from '@nestjs/common';
import { concatMap, map, toArray } from 'rxjs';

import { VoiceService } from '@app/voice/voice.service';
import { CreateSpeechFromPromptDTO, CreateSpeechFromTextDTO } from '@app/voice/dto/create-voice.dto';
import { ContentService } from '@app/content/content.service';

@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly contentService: ContentService,
  ) {}

  @Post('/text')
  generateVoiceFromText(@Body() body: CreateSpeechFromTextDTO) {
    return this.voiceService.createAudioFileFromText(body).pipe(map((value) => ({ source: value, text: body.text })));
  }

  @Post('/prompt')
  generateVoiceFromPrompt(@Body() body: CreateSpeechFromPromptDTO) {
    return this.contentService.createTextContentsFromPrompt(body.prompt).pipe(
      concatMap((text) => {
        return this.voiceService.createAudioFileFromText({ text }).pipe(map((source) => ({ source, text })));
      }),
      toArray(),
    );
  }
}
