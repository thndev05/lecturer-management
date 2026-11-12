import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateLecturerDto {
  @ApiProperty({ example: 'GV001' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  IDGV!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  Fullname!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\/res\.cloudinary\.com\//)
  @MaxLength(2048)
  Image!: string;

  @ApiProperty({ example: 3, minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  SumClass!: number;
}

export class UpdateLecturerDto extends PartialType(CreateLecturerDto, {
  skipNullProperties: false,
}) {}

export class ListLecturersDto {
  @ApiPropertyOptional({
    description: 'Tìm chứa theo Fullname hoặc IDGV, không phân biệt hoa/thường',
    example: 'Nguyễn',
    maxLength: 120,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
