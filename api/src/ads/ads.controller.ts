import _ from 'lodash/fp';
import { Body, Controller, Post } from '@nestjs/common';
import { concatMap, forkJoin, map, of, switchMap, toArray } from 'rxjs';

import { ContentService } from '@app/content/content.service';
import { SpeechService } from '@app/speech/speech.service';
import { TokenizerService } from '@app/tokenizer/tokenizer.service';
import { VideoService } from '@app/video/video.service';
import { Scene, Speech, Video } from '@app/common/types/ads';
import { CreateAdsFromPromptDTO } from '@app/ads/dto/create-ads.dto';

const DURATION = 6000;

@Controller('ads')
export class AdsController {
  constructor(
    private readonly videoService: VideoService,
    private readonly tokenizerService: TokenizerService,
    private readonly contentService: ContentService,
    private readonly speechService: SpeechService,
  ) {}

  @Post('/prompt')
  generateAdsFromPrompt(@Body() body: CreateAdsFromPromptDTO) {
    return this.tokenizerService.generateTagsFromPrompt(body.prompt).pipe(
      switchMap((tags) =>
        forkJoin([
          this.videoService.fetchVideosFromTags(tags),
          this.contentService.createTextContentsFromTags(tags).pipe(
            concatMap((subtitle) => this.speechService.createSpeechFromText({ text: subtitle })),
            toArray(),
          ),
          of(tags),
        ]),
      ),
      map(([videos, speech, tags]) => {
        const scene = _.map((partial) => ({ ...partial, duration: DURATION }) as Scene, _.zipWith((video: Video, speech: Speech) => ({ video, speech }))(videos, speech));
        const duration = _.reduce((result, element) => result + element.duration, 0, scene);
        scene.push({ audio: videos.at(0).meta.audios.at(0), duration: duration });
        return _.assign({ tags, prompt: body.prompt })({ scene: scene, duration: duration, format: body.format });
      }),
    );
  }
}
