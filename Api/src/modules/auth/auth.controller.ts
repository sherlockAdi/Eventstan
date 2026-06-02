import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiCreatedResponse({ description: 'Demo login response. Replace with JWT/Auth.js integration.' })
  login(@Body() dto: LoginDto) {
    return {
      accessToken: 'demo-access-token',
      tokenType: 'Bearer',
      user: { id: 'usr_demo', email: dto.email, role: dto.email.includes('admin') ? 'ADMIN' : 'CUSTOMER' },
    };
  }

  @Post('otp/request')
  @ApiCreatedResponse({ description: 'Requests OTP for mobile login.' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return { phone: dto.phone, expiresInSeconds: 300, message: 'OTP sent through configured provider.' };
  }
}
