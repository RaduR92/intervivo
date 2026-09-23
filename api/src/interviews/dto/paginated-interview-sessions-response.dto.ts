import { ApiProperty } from '@nestjs/swagger';
import { InterviewSessionResponseDto } from './interview-session-response.dto.js';

export class PaginatedInterviewSessionsResponseDto {
  @ApiProperty({ type: InterviewSessionResponseDto, isArray: true })
  data!: InterviewSessionResponseDto[];

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 20 })
  take!: number;

  @ApiProperty({ example: 0 })
  skip!: number;
}
