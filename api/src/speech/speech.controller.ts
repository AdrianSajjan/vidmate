import { Body, Controller, Post } from '@nestjs/common';
import { concatMap, map, toArray } from 'rxjs';

import { SpeechService } from '@app/speech/speech.service';
import { ContentService } from '@app/content/content.service';
import { CreateSpeechFromPromptDTO, CreateSpeechFromTextDTO } from '@app/speech/dto/create-speech.dto';

@Controller('speech')
export class SpeechController {
  constructor(
    private readonly speechService: SpeechService,
    private readonly contentService: ContentService,
  ) {}

  @Post('/text')
  generateSpeechFromText(@Body() body: CreateSpeechFromTextDTO) {
    return this.speechService.createSpeechAudioFileFromText(body).pipe(map((value) => ({ source: value, text: body.text })));
  }

  @Post('/prompt')
  generateSpeechFromPrompt(@Body() body: CreateSpeechFromPromptDTO) {
    return this.contentService.createTextContentsFromPrompt(body.prompt).pipe(
      concatMap((text) => this.speechService.createSpeechAudioFileFromText({ text }).pipe(map((source) => ({ source, text })))),
      toArray(),
    );
  }
}
