import { ApiProperty } from '@nestjs/swagger';

/** Just enough of the InterviewSession to identify it in a feedback list. */
export class FeedbackSessionSummaryDto {
  @ApiProperty({ example: 'b1f2c3d4-5e6f-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  position!: string;

  @ApiProperty({ example: '2026-10-01T14:00:00.000Z' })
  scheduledAt!: Date;
}
