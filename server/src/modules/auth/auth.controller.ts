import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './services/auth.service';
import { UserRegisterDto } from './dto/register.dto';
import { UserLoginDto } from './dto/login.dto';
import { CoreControllers } from 'libs/utils/decorators/controller-customer.decorator';

@CoreControllers({
  path: 'auth',
  tag: 'Auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: UserRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: UserLoginDto) {
    return this.authService.login(dto);
  }
}
