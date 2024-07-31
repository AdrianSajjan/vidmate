import { Audio } from '@app/common/types/ads';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AudioService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateMasterAudioFromTags(tags: string[]) {
    return new Observable<Audio>((subscriber) => {
      subscriber.next();
      subscriber.complete();
    });
  }
}
