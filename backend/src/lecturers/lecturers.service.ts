import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiangVien } from './lecturer.schema';
import { CreateLecturerDto, UpdateLecturerDto } from './lecturer.dto';

@Injectable()
export class LecturersService implements OnModuleInit {
  constructor(@InjectModel(GiangVien.name) private readonly lecturers: Model<GiangVien>) {}

  async onModuleInit() { await this.lecturers.init(); }

  list(search?: string) {
    // Treat user input as literal text, never as a regular expression.
    const pattern = search ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : undefined;
    const filter = pattern ? { $or: [{ IDGV: pattern }, { Fullname: pattern }] } : {};
    return this.lecturers.find(filter).sort({ IDGV: 1 }).lean();
  }

  export() { return this.lecturers.find({}, { _id: 0 }).sort({ IDGV: 1 }).lean(); }

  async get(IDGV: string) {
    const lecturer = await this.lecturers.findOne({ IDGV }).lean();
    if (!lecturer) throw new NotFoundException('Không tìm thấy giảng viên');
    return lecturer;
  }

  async create(dto: CreateLecturerDto) {
    try { return await this.lecturers.create(dto); }
    catch (error) { this.rethrow(error); }
  }

  async update(IDGV: string, dto: UpdateLecturerDto) {
    try {
      const lecturer = await this.lecturers.findOneAndUpdate({ IDGV }, { $set: dto }, { new: true, runValidators: true }).lean();
      if (!lecturer) throw new NotFoundException('Không tìm thấy giảng viên');
      return lecturer;
    } catch (error) { this.rethrow(error); }
  }

  async delete(IDGV: string) {
    const result = await this.lecturers.deleteOne({ IDGV });
    if (!result.deletedCount) throw new NotFoundException('Không tìm thấy giảng viên');
    return { message: 'Đã xóa giảng viên' };
  }

  private rethrow(error: unknown): never {
    if ((error as { code?: number }).code === 11000) throw new ConflictException('Mã giảng viên đã tồn tại');
    throw error;
  }
}
