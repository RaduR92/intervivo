import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

/**
 * Returned by login and refresh. Access/refresh tokens themselves are never
 * in the body — they're set as httpOnly cookies (see the endpoint docs).
 */
export class SessionResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
