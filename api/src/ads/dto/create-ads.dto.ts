import { IsNotEmpty } from 'class-validator';

export class CreateAdsFromPromptDTO {
  @IsNotEmpty()
  prompt: string;
  @IsNotEmpty()
  format: string;
}
