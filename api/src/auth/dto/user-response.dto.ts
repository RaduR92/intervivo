import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '20259ae5-746b-44d4-a3d0-c2d9aa3523ed' })
  id!: string;

  @ApiProperty({ example: 'alexander@systems.internal' })
  email!: string;
}
