import { ApiProperty } from '@nestjs/swagger';
import { SKILLS } from '@users/constants/skills.js';

export class CandidateProfileResponseDto {
  @ApiProperty({ required: false, nullable: true, example: '+1 555 123 4567' })
  phone!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Software Engineer' })
  currentRole!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 4 })
  yearsExperience!: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Senior Software Engineer',
  })
  targetRole!: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://example.com/resume.pdf',
  })
  resumeUrl!: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Referred by an existing hire.',
  })
  notes!: string | null;

  @ApiProperty({
    enum: SKILLS,
    isArray: true,
    example: ['JavaScript', 'TypeScript', 'React'],
  })
  skills!: string[];
}
