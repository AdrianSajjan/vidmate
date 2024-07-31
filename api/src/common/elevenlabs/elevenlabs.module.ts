import { Global, Module } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@app/common/config/env';

@Global()
@Module({
  providers: [
    {
      provide: ElevenLabsClient,
      useFactory: (configService: ConfigService<EnvConfig>) => {
        return new ElevenLabsClient({
          apiKey: configService.get('elevenLabsApiKey'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ElevenLabsClient],
})
export class ElevenlabsModule {}
