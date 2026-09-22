import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({
    example: 1000,
    description:
      'Stable machine-readable code. The UI keys off this to pick a localized message — never parse `message`.',
  })
  code!: number;

  @ApiProperty({
    example: 'Invalid email or password',
    description: 'Developer-facing detail only (logs, network tab).',
  })
  message!: string;
}
