import { Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Controller } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor() {}

  // アクセストークンからユーザー情報の取得
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    return req.user;
  }
}
