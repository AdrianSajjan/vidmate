import { Body, Controller, Post } from '@nestjs/common';
import { concatMap, map, switchMap, toArray } from 'rxjs';

import { SpeechService } from '@app/speech/speech.service';
import { ContentService } from '@app/content/content.service';
import { CreateSpeechFromPromptDTO, CreateSpeechFromTextDTO } from '@app/speech/dto/create-speech.dto';
import { TokenizerService } from '@app/tokenizer/tokenizer.service';

@Controller('speech')
export class SpeechController {
  constructor(
    private readonly speechService: SpeechService,
    private readonly contentService: ContentService,
    private readonly tokenizerService: TokenizerService,
  ) {}

  @Post('/text')
  generateSpeechFromText(@Body() body: CreateSpeechFromTextDTO) {
    return this.speechService.createSpeechFromText(body).pipe(map((value) => ({ source: value, text: body.text })));
  }

  @Post('/prompt')
  generateSpeechFromPrompt(@Body() body: CreateSpeechFromPromptDTO) {
    return this.tokenizerService.generateTagsFromPrompt(body.prompt).pipe(
      switchMap((tags) =>
        this.contentService.createTextContentsFromTags(tags).pipe(
          concatMap((text) => this.speechService.createSpeechFromText({ text }).pipe(map((source) => ({ source, text })))),
          toArray(),
        ),
      ),
    );
  }
}
