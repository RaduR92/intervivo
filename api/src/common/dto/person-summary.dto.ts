import { ApiProperty } from '@nestjs/swagger';

/** Minimal person reference embedded in other responses (e.g. an interview's candidate/interviewer). */
export class PersonSummaryDto {
  @ApiProperty({ example: '20259ae5-746b-44d4-a3d0-c2d9aa3523ed' })
  id!: string;

  @ApiProperty({ example: 'Alexander' })
  firstName!: string;

  @ApiProperty({ example: 'Systems' })
  lastName!: string;

  @ApiProperty({ example: 'alexander@systems.internal' })
  email!: string;
}
