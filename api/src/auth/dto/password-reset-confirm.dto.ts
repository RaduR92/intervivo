import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class PasswordResetConfirmDto {
  @ApiProperty({
    description: 'The raw reset token (from password-reset/request).',
    example: 'c31b211b15e5b1ace650edfca068a40a688b4fc303c0ce70819628976eaca6b4',
  })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'newpassword456', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
