import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { envConfig } from './config/env';
import { ElevenlabsModule } from './common/elevenlabs/elevenlabs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    ElevenlabsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
