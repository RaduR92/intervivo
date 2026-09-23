import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Recommendation } from '@generated/prisma/enums.js';

const RECOMMENDATION_VALUES = Object.values(Recommendation);

export class CreateFeedbackDto {
  @ApiProperty({ example: 'b1f2c3d4-5e6f-7890-abcd-ef1234567890' })
  @IsUUID()
  sessionId!: string;

  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number;

  @ApiProperty({ enum: RECOMMENDATION_VALUES, example: Recommendation.HIRE })
  @IsIn(RECOMMENDATION_VALUES)
  recommendation!: Recommendation;

  @ApiProperty({ example: 'Strong problem-solving, clear communication.' })
  @IsString()
  @MinLength(1)
  comments!: string;

  @ApiPropertyOptional({ example: 'Deep systems knowledge, calm under pressure.' })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional({ example: 'Could be more concise when explaining trade-offs.' })
  @IsOptional()
  @IsString()
  improvementAreas?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Whether the candidate can see this immediately.',
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
