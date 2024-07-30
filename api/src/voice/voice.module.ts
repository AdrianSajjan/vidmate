import { Module } from '@nestjs/common';

import { VoiceController } from '@app/voice/voice.controller';
import { VoiceService } from '@app/voice/voice.service';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
