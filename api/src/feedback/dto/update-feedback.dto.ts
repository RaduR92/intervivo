import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Recommendation } from '@generated/prisma/enums.js';

const RECOMMENDATION_VALUES = Object.values(Recommendation);

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ enum: RECOMMENDATION_VALUES, example: Recommendation.HIRE })
  @IsOptional()
  @IsIn(RECOMMENDATION_VALUES)
  recommendation?: Recommendation;

  @ApiPropertyOptional({ example: 'Strong problem-solving, clear communication.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  comments?: string;

  @ApiPropertyOptional({ example: 'Deep systems knowledge, calm under pressure.' })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional({ example: 'Could be more concise when explaining trade-offs.' })
  @IsOptional()
  @IsString()
  improvementAreas?: string;

  @ApiPropertyOptional({ description: 'Toggle candidate visibility.' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
