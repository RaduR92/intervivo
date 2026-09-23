import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { InterviewStatus } from '@generated/prisma/enums.js';

const STATUS_VALUES = Object.values(InterviewStatus);

export class UpdateInterviewSessionDto {
  @ApiPropertyOptional({ example: '20259ae5-746b-44d4-a3d0-c2d9aa3523ed' })
  @IsOptional()
  @IsUUID()
  interviewerId?: string;

  @ApiPropertyOptional({ example: '2026-10-02T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 60, minimum: 15, maximum: 480 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ enum: STATUS_VALUES, example: InterviewStatus.COMPLETED })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: InterviewStatus;

  @ApiPropertyOptional({ example: 'https://meet.example.com/abc' })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiPropertyOptional({ example: 'Focus on system design.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
