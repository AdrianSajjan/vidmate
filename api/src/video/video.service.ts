import { videos } from '@app/common/mock/videos.mock';
import { Video } from '@app/common/types/ads';
import { Injectable } from '@nestjs/common';
import _ from 'lodash/fp';
import { Observable } from 'rxjs';

@Injectable()
export class VideoService {
  fetchVideosFromTags(tags: string[]) {
    return new Observable<Video[]>((subscriber) => {
      subscriber.next(_.filter(_.flow(_.get('meta.tags'), _.intersection(tags), _.negate(_.isEmpty)), videos));
      subscriber.complete();
    });
  }
}
