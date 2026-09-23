import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListFeedbackQueryDto {
  @ApiPropertyOptional({
    description: 'HR only — filter to one candidate. Ignored for CANDIDATE callers (always forced to themself).',
    example: 'c207ee72-4f44-4a24-9747-5a438a181f13',
  })
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;
}
