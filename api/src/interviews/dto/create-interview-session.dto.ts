import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateInterviewSessionDto {
  @ApiProperty({ example: 'c207ee72-4f44-4a24-9747-5a438a181f13' })
  @IsUUID()
  candidateId!: string;

  @ApiProperty({ example: '20259ae5-746b-44d4-a3d0-c2d9aa3523ed' })
  @IsUUID()
  interviewerId!: string;

  @ApiProperty({ example: '2026-10-01T14:00:00.000Z' })
  @IsDateString()
  scheduledAt!: string;

  @ApiProperty({ example: 60, minimum: 15, maximum: 480 })
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  position!: string;

  @ApiProperty({ required: false, example: 'https://meet.example.com/abc' })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiProperty({ required: false, example: 'Focus on system design.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
