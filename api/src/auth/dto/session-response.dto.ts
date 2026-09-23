import { ApiProperty } from '@nestjs/swagger';
import { SessionUserDto } from './session-user.dto.js';

/**
 * Returned by login and refresh. Access/refresh tokens themselves are never
 * in the body — they're set as httpOnly cookies (see the endpoint docs).
 */
export class SessionResponseDto {
  @ApiProperty({ type: SessionUserDto })
  user!: SessionUserDto;
}
