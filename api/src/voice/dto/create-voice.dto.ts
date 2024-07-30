import { IsNotEmpty } from 'class-validator';

export class CreateSpeechFromTextDTO {
  @IsNotEmpty()
  text: string;
  voice?: string;
  model?: string;
}

export class CreateSpeechFromPromptDTO {
  @IsNotEmpty()
  prompt: string;
}
