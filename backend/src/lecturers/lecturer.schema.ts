import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'GiangVien', versionKey: false })
export class GiangVien {
  @Prop({ required: true, unique: true, trim: true })
  IDGV!: string;

  @Prop({ required: true, trim: true })
  Fullname!: string;

  @Prop({ required: true })
  Image!: string;

  @Prop({ required: true, min: 0 })
  SumClass!: number;
}

export const GiangVienSchema = SchemaFactory.createForClass(GiangVien);
