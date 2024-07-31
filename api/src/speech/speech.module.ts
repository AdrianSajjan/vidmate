import { Module } from '@nestjs/common';

import { SpeechController } from '@app/speech/speech.controller';
import { SpeechService } from '@app/speech/speech.service';
import { ContentModule } from '@app/content/content.module';
import { TokenizerModule } from '@app/tokenizer/tokenizer.module';

@Module({
  imports: [ContentModule, TokenizerModule],
  controllers: [SpeechController],
  providers: [SpeechService],
  exports: [SpeechService],
})
export class SpeechModule {}
