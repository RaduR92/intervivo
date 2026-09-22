import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'alexander@systems.internal' })
  @IsEmail()
  email!: string;
}
