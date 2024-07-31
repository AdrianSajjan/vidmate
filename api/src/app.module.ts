import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { envConfig } from '@app/common/config/env';
import { ElevenlabsModule } from '@app/common/elevenlabs/elevenlabs.module';
import { ContentModule } from '@app/content/content.module';
import { SpeechModule } from '@app/speech/speech.module';
import { AdsModule } from './ads/ads.module';
import { VideoModule } from './video/video.module';
import { TokenizerModule } from './tokenizer/tokenizer.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [envConfig] }),
    ServeStaticModule.forRoot({ rootPath: path.join(__dirname, '..', 'uploads') }),
    ElevenlabsModule,
    ContentModule,
    SpeechModule,
    AdsModule,
    VideoModule,
    TokenizerModule,
    AudioModule,
  ],
})
export class AppModule {}
