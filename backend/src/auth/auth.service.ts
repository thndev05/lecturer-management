import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isEmail } from 'class-validator';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly email: string;
  private readonly fullname: string;
  private readonly passwordDigest: Buffer;
  private readonly subject: string;

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.email = config.getOrThrow<string>('ADMIN_EMAIL').trim().toLowerCase();
    this.fullname = config.get<string>('ADMIN_FULLNAME', 'Quản trị viên').trim();
    const password = config.getOrThrow<string>('ADMIN_PASSWORD');
    if (!isEmail(this.email) || this.email.length > 254)
      throw new Error('ADMIN_EMAIL phải là email hợp lệ');
    if (!this.fullname || this.fullname.length > 120)
      throw new Error('ADMIN_FULLNAME phải có từ 1 đến 120 ký tự');
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72)
      throw new Error('ADMIN_PASSWORD phải có ít nhất 8 ký tự và tối đa 72 byte UTF-8');
    this.passwordDigest = createHash('sha256').update(password).digest();
    // Changing credentials and restarting also invalidates previously issued tokens.
    this.subject = createHmac('sha256', config.getOrThrow<string>('JWT_SECRET'))
      .update(this.email)
      .update('\0')
      .update(password)
      .digest('hex');
  }

  async login(dto: LoginDto) {
    const passwordMatches = timingSafeEqual(
      createHash('sha256').update(dto.Password).digest(),
      this.passwordDigest,
    );
    if (dto.Email !== this.email || !passwordMatches)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    return {
      accessToken: await this.jwt.signAsync({ sub: this.subject }),
      tokenType: 'Bearer',
    };
  }

  profile(subject: string) {
    if (subject !== this.subject) throw new UnauthorizedException('Tài khoản không còn hợp lệ');
    // Preserve the profile contract consumed by the app; this ID is not a MongoDB document.
    return { _id: 'admin', Fullname: this.fullname, Email: this.email };
  }
}
