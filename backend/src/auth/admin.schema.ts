import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'QuanTriVien', versionKey: false })
export class QuanTriVien {
  @Prop({ required: true, trim: true })
  Fullname!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  Email!: string;

  @Prop({ required: true, select: false })
  PasswordHash!: string;
}

export const QuanTriVienSchema = SchemaFactory.createForClass(QuanTriVien);
