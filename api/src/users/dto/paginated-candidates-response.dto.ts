import { ApiProperty } from '@nestjs/swagger';
import { CandidateResponseDto } from './candidate-response.dto.js';

export class PaginatedCandidatesResponseDto {
  @ApiProperty({ type: CandidateResponseDto, isArray: true })
  data!: CandidateResponseDto[];

  @ApiProperty({ example: 42, description: 'Total matching candidates, ignoring take/skip.' })
  total!: number;

  @ApiProperty({ example: 20 })
  take!: number;

  @ApiProperty({ example: 0 })
  skip!: number;
}
