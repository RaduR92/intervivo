import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { SKILLS } from '@users/constants/skills.js';

export class CreateCandidateDto {
  @ApiProperty({ example: 'jordan@candidates.internal' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jordan' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Candidate' })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'Temporary password, set by HR when creating the account.',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

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
    enum: SKILLS,
    isArray: true,
    example: ['JavaScript', 'TypeScript', 'React'],
    description:
      'Must come from the fixed skill list — anything else is rejected.',
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(SKILLS, { each: true })
  skills!: string[];
}
