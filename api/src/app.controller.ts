import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TextToSpeechDTO } from './data-access/text-to-speech.data-access';
import { map } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/text-to-speech')
  generateSpeechFromText(@Body() body: TextToSpeechDTO) {
    return this.appService
      .createAudioFileFromText(body.text)
      .pipe(map((value) => ({ file: value })));
  }
}
