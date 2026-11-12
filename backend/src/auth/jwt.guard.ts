import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthService } from './auth.service';

export type AuthRequest = Request & { admin: { _id: unknown; Fullname: string; Email: string } };

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const parts = request.headers.authorization?.split(' ');
    if (parts?.length !== 2 || parts[0] !== 'Bearer' || !parts[1])
      throw new UnauthorizedException('Cần đăng nhập');
    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; exp: number }>(parts[1], {
        algorithms: ['HS256'],
      });
      if (typeof payload.sub !== 'string' || !Number.isFinite(payload.exp))
        throw new Error('Invalid claims');
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    request.admin = await this.auth.profile(sub);
    return true;
  }
}
