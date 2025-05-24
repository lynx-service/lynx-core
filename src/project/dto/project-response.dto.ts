import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';

export class ProjectResponseDto implements Project {
  @ApiProperty({ example: 1, description: 'プロジェクトID' })
  id: number;

  @ApiProperty({ example: 1, description: 'ワークスペースID' })
  workspaceId: number;

  @ApiProperty({
    example: 'https://example.com',
    description: 'プロジェクトURL',
  })
  projectUrl: string;

  @ApiProperty({ example: 'マイプロジェクト', description: 'プロジェクト名' })
  projectName: string;

  @ApiProperty({
    example: 'これはサンプルプロジェクトです',
    nullable: true,
    description: 'プロジェクトの説明',
  })
  description: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
    description: '最終取得日',
  })
  lastAcquisitionDate: Date | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: '更新日時' })
  updatedAt: Date;
}
