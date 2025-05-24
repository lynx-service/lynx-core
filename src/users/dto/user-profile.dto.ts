import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from '../../project/dto/project-response.dto';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ユーザーID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'メールアドレス' })
  email: string;

  @ApiProperty({ example: 'テストユーザー', description: 'ユーザー名' })
  name: string;

  @ApiProperty({ example: 1, description: 'ワークスペースID', nullable: true })
  workspaceId: number | null;

  @ApiProperty({
    description: 'ユーザーに関連付けられたプロジェクトの配列',
    type: () => [ProjectResponseDto], // Swaggerのために型を指定
  })
  projects: ProjectResponseDto[];
}
