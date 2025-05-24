import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';

export class ProjectResponseDto implements Project {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  workspaceId: number;

  @ApiProperty({ example: 'https://example.com' })
  projectUrl: string;

  @ApiProperty({ example: 'マイプロジェクト' })
  projectName: string;

  @ApiProperty({ example: 'これはサンプルプロジェクトです', nullable: true })
  description: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', nullable: true })
  lastAcquisitionDate: Date | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
