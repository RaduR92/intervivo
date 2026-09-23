import { ApiProperty } from '@nestjs/swagger';
import { FeedbackResponseDto } from './feedback-response.dto.js';

export class PaginatedFeedbackResponseDto {
  @ApiProperty({ type: FeedbackResponseDto, isArray: true })
  data!: FeedbackResponseDto[];

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 20 })
  take!: number;

  @ApiProperty({ example: 0 })
  skip!: number;
}
