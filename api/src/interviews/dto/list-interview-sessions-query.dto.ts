import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { InterviewStatus, InterviewType } from '@generated/prisma/enums.js';

const STATUS_VALUES = Object.values(InterviewStatus);
const TYPE_VALUES = Object.values(InterviewType);

export class ListInterviewSessionsQueryDto {
  @ApiPropertyOptional({
    enum: ['upcoming', 'history'],
    description:
      'upcoming = SCHEDULED sessions; history = COMPLETED/CANCELLED. Omit for all. ' +
      'Ignored when status is given.',
  })
  @IsOptional()
  @IsIn(['upcoming', 'history'])
  section?: 'upcoming' | 'history';

  @ApiPropertyOptional({
    enum: STATUS_VALUES,
    description: 'Filter to one exact status. Takes precedence over section.',
  })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: InterviewStatus;

  @ApiPropertyOptional({ enum: TYPE_VALUES })
  @IsOptional()
  @IsIn(TYPE_VALUES)
  type?: InterviewType;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against candidate name or position.',
    example: 'senior',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
