import { ApiProperty } from '@nestjs/swagger';
import { CandidateProfileResponseDto } from './candidate-profile-response.dto.js';

export class CandidateResponseDto {
  @ApiProperty({ example: 'c207ee72-4f44-4a24-9747-5a438a181f13' })
  id!: string;

  @ApiProperty({ example: 'jordan@candidates.internal' })
  email!: string;

  @ApiProperty({ example: 'Jordan' })
  firstName!: string;

  @ApiProperty({ example: 'Candidate' })
  lastName!: string;

  @ApiProperty({ example: '2026-09-23T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: CandidateProfileResponseDto })
  profile!: CandidateProfileResponseDto;
}
