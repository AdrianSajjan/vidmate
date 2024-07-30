import { Module } from '@nestjs/common';

import { SpeechController } from '@app/speech/speech.controller';
import { SpeechService } from '@app/speech/speech.service';
import { ContentModule } from '@app/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [SpeechController],
  providers: [SpeechService],
})
export class SpeechModule {}
