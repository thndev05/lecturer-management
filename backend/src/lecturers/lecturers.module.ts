import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { GiangVien, GiangVienSchema } from './lecturer.schema';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: GiangVien.name, schema: GiangVienSchema }])],
  controllers: [LecturersController],
  providers: [LecturersService],
})
export class LecturersModule {}
