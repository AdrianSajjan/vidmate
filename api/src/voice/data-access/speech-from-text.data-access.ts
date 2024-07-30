import { IsNotEmpty } from 'class-validator';

export class SpeechFromTextDTO {
  @IsNotEmpty()
  text: string;

  voice?: string;

  model?: string;
}
