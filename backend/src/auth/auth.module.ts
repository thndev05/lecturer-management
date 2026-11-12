import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { QuanTriVien, QuanTriVienSchema } from './admin.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QuanTriVien.name, schema: QuanTriVienSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET phải có ít nhất 32 byte');
        const expiresIn = config.get<string>('JWT_EXPIRES_IN', '1h');
        if (!/^[1-9]\d*(s|m|h|d)$/.test(expiresIn)) throw new Error('JWT_EXPIRES_IN phải có dạng 15m, 1h hoặc 1d');
        return { secret, signOptions: { algorithm: 'HS256', expiresIn: expiresIn as JwtSignOptions['expiresIn'] } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard],
  exports: [JwtGuard, JwtModule, AuthService],
})
export class AuthModule {}
