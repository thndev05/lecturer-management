import { BadRequestException, ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { QuanTriVien } from './admin.schema';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@InjectModel(QuanTriVien.name) private readonly admins: Model<QuanTriVien>, private readonly jwt: JwtService) {}

  async onModuleInit() {
    // Ensure uniqueness is enforced before accepting requests, including concurrent ones.
    await this.admins.init();
  }

  async register(dto: RegisterDto) {
    if (dto.Password !== dto.ConfirmPassword) throw new BadRequestException('Mật khẩu xác nhận không khớp');
    if (dto.Password.length < 8 || Buffer.byteLength(dto.Password, 'utf8') > 72) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte UTF-8');
    }
    const PasswordHash = await bcrypt.hash(dto.Password, 12);
    try {
      const admin = await this.admins.create({ Fullname: dto.Fullname, Email: dto.Email, PasswordHash });
      return { _id: admin._id.toString(), Fullname: admin.Fullname, Email: admin.Email };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) throw new ConflictException('Email đã được đăng ký');
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const admin = await this.admins.findOne({ Email: dto.Email }).select('+PasswordHash');
    if (!admin || Buffer.byteLength(dto.Password, 'utf8') > 72 || !await bcrypt.compare(dto.Password, admin.PasswordHash)) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return { accessToken: await this.jwt.signAsync({ sub: admin._id.toString() }), tokenType: 'Bearer' };
  }

  async profile(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new UnauthorizedException('Token không hợp lệ');
    const admin = await this.admins.findById(id).lean();
    if (!admin) throw new UnauthorizedException('Tài khoản không còn tồn tại');
    return admin;
  }
}
