import { ContentService } from '@app/content/content.service';
import { Controller } from '@nestjs/common';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}
}
