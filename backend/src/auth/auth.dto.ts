import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  Email!: string;

  @ApiProperty({ minLength: 8, maxLength: 72, format: 'password' })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  Password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  Fullname!: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  ConfirmPassword!: string;
}
