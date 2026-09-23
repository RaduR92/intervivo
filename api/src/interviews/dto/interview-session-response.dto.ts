import { ApiProperty } from '@nestjs/swagger';
import { InterviewStatus, InterviewType } from '@generated/prisma/enums.js';
import { PersonSummaryDto } from '@common/dto/person-summary.dto.js';

export class InterviewSessionResponseDto {
  @ApiProperty({ example: 'b1f2c3d4-5e6f-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ type: PersonSummaryDto })
  candidate!: PersonSummaryDto;

  @ApiProperty({ type: PersonSummaryDto })
  interviewer!: PersonSummaryDto;

  @ApiProperty({ example: '2026-10-01T14:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: 60 })
  durationMinutes!: number;

  @ApiProperty({ example: 'Senior Software Engineer' })
  position!: string;

  @ApiProperty({ enum: InterviewType, example: InterviewType.TECHNICAL })
  type!: InterviewType;

  @ApiProperty({ enum: InterviewStatus, example: InterviewStatus.SCHEDULED })
  status!: InterviewStatus;

  @ApiProperty({ required: false, nullable: true, example: 'https://meet.example.com/abc' })
  meetingLink!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Focus on system design.' })
  notes!: string | null;

  @ApiProperty({ example: '2026-09-23T00:00:00.000Z' })
  createdAt!: Date;
}
