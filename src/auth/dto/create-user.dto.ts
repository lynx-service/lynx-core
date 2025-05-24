import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'テストユーザー', description: 'ユーザー名' })
  @IsNotEmpty({ message: '名前は必須です' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'メールアドレス' })
  @IsEmail({}, { message: 'Emailの形式が正しくありません' })
  @IsNotEmpty({ message: 'Emailは必須です' })
  email: string;
}
