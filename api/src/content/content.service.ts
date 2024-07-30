import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

const contents = [
  'Introducing the ultimate performance boost - the new SprintX Sports Shoes!',
  'Engineered with state-of-the-art technology for unmatched comfort and durability.',
  //   'Experience the perfect grip with our advanced traction soles on any terrain.',
  //   'Lightweight design meets dynamic support, keeping you agile and swift.',
  //   'Ideal for athletes and fitness enthusiasts who demand the best in sportswear.',
  //   'Grab yours today and feel the difference in every step you take!',
];

@Injectable()
export class ContentService {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTextContentsFromPrompt(prompt: string) {
    return new Observable<string>((subscriber) => {
      for (const content of contents) {
        subscriber.next(content);
      }
      subscriber.complete();
    });
  }
}
