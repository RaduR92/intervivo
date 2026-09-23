import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { SKILLS } from '@users/constants/skills.js';

export class UpdateCandidateDto {
  @ApiProperty({ required: false, example: '+1 555 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  currentRole?: string;

  @ApiProperty({ required: false, example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @ApiProperty({ required: false, example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  targetRole?: string;

  @ApiProperty({ required: false, example: 'https://example.com/resume.pdf' })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @ApiProperty({ required: false, example: 'Referred by an existing hire.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    required: false,
    enum: SKILLS,
    isArray: true,
    example: ['JavaScript', 'TypeScript', 'React'],
    description:
      'Must come from the fixed skill list — anything else is rejected.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(SKILLS, { each: true })
  skills?: string[];
}
