import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Basic account fields any role can self-edit. Email is deliberately not
 * here — changing it is a separate concern (uniqueness, verification).
 * CANDIDATE-specific fields (phone, skills, etc.) go through
 * PATCH /users/candidates/:id instead — this only covers what HR and
 * CANDIDATE both have.
 */
export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Alexander' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Systems' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;
}
