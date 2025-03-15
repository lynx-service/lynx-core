import { Controller, Post, Body, UseGuards, Get, Req, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // GoogleストラテジーによってGoogleログインページにリダイレクト
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirect(@Req() req) {
    const tokens = await this.authService.login(req.user);
    const frontendUrl = new URL('http://localhost:5173/auth/success');
    frontendUrl.searchParams.set('token', tokens.accessToken);
    frontendUrl.searchParams.set('refreshToken', tokens.refreshToken);
    
    return { url: frontendUrl.toString() };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
