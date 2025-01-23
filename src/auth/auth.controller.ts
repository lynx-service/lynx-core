import { Controller, Request, Get, UseGuards, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // Guard redirects
  }

  @Get('google/callback')
  @Redirect('http://localhost:5173')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req) {
    const user = req.user;
    const token = await this.authService.login(user);
    const redirectUrl = `http://localhost:5173/auth/success?token=${token.access_token}`;
    return { url: redirectUrl };
  }
}
