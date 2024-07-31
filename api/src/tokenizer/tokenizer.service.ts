import { Injectable } from '@nestjs/common';
import _ from 'lodash/fp';
import { Observable } from 'rxjs';

@Injectable()
export class TokenizerService {
  generateTagsFromPrompt(prompt: string) {
    return new Observable<string[]>((subscriber) => {
      subscriber.next(_.flow(_.split(' '), _.map(_.lowerCase))(prompt));
      subscriber.complete();
    });
  }
}
