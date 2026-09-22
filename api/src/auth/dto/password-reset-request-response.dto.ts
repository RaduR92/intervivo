import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetRequestResponseDto {
  @ApiProperty({
    example: 'If an account exists for this email, a reset link has been sent.',
  })
  message!: string;

  @ApiProperty({
    required: false,
    description:
      'Only present outside production, since there is no email delivery yet — the raw token that would normally be emailed.',
    example: 'c31b211b15e5b1ace650edfca068a40a688b4fc303c0ce70819628976eaca6b4',
  })
  resetToken?: string;
}
