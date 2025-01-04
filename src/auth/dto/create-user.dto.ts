import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '名前は必須です' })
  name: string;

  @IsEmail({}, { message: 'Emailの形式が正しくありません' })
  @IsNotEmpty({ message: 'Emailは必須です' })
  email: string;

  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(6, { message: 'パスワードは6文字以上で入力してください' })
  password: string;
}
