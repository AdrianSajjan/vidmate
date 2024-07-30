import { Module } from '@nestjs/common';

import { VoiceController } from '@app/voice/voice.controller';
import { VoiceService } from '@app/voice/voice.service';
import { ContentModule } from '@app/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
