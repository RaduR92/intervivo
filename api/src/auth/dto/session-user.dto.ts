import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums.js';

/** The minimal identity embedded in a session — returned by login/refresh. */
export class SessionUserDto {
  @ApiProperty({ example: '20259ae5-746b-44d4-a3d0-c2d9aa3523ed' })
  id!: string;

  @ApiProperty({ example: 'alexander@systems.internal' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.HR })
  role!: Role;
}
