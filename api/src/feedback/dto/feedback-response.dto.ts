import { ApiProperty } from '@nestjs/swagger';
import { Recommendation } from '@generated/prisma/enums.js';
import { PersonSummaryDto } from '@common/dto/person-summary.dto.js';
import { FeedbackSessionSummaryDto } from './feedback-session-summary.dto.js';

export class FeedbackResponseDto {
  @ApiProperty({ example: 'd4e5f6a7-8901-2345-bcde-f67890123456' })
  id!: string;

  @ApiProperty({ type: FeedbackSessionSummaryDto })
  session!: FeedbackSessionSummaryDto;

  @ApiProperty({ type: PersonSummaryDto })
  author!: PersonSummaryDto;

  @ApiProperty({ required: false, nullable: true, example: 4 })
  rating!: number | null;

  @ApiProperty({ enum: Recommendation, example: Recommendation.HIRE })
  recommendation!: Recommendation;

  @ApiProperty({ example: 'Strong problem-solving, clear communication.' })
  comments!: string;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty({ required: false, nullable: true, example: '2026-10-02T09:00:00.000Z' })
  publishedAt!: Date | null;

  @ApiProperty({ example: '2026-10-01T16:00:00.000Z' })
  createdAt!: Date;
}
