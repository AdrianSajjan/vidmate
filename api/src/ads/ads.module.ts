import { AdsController } from '@app/ads/ads.controller';
import { AdsService } from '@app/ads/ads.service';
import { AudioModule } from '@app/audio/audio.module';
import { ContentModule } from '@app/content/content.module';
import { SpeechModule } from '@app/speech/speech.module';
import { TokenizerModule } from '@app/tokenizer/tokenizer.module';
import { VideoModule } from '@app/video/video.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [TokenizerModule, VideoModule, AudioModule, SpeechModule, ContentModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
