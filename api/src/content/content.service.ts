import { contents } from '@app/common/mock/contents.mock';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ContentService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTextContentsFromTags(tags: string[]) {
    return new Observable<string>((subscriber) => {
      for (const content of contents) {
        subscriber.next(content);
      }
      subscriber.complete();
    });
  }
}
