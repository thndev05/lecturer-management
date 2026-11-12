import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateLecturerDto, ListLecturersDto, UpdateLecturerDto } from './lecturer.dto';
import { LecturersService } from './lecturers.service';

@ApiTags('Giảng viên')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('giang-vien')
export class LecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get()
  list(@Query() query: ListLecturersDto) { return this.lecturers.list(query.search); }

  @Get('export')
  @Header('Content-Disposition', 'attachment; filename="GiangVien.json"')
  @ApiOperation({ summary: 'Xuất JSON bốn trường nghiệp vụ để nộp bài' })
  export() { return this.lecturers.export(); }

  @Get(':IDGV')
  get(@Param('IDGV') id: string) { return this.lecturers.get(id); }

  @Post()
  create(@Body() dto: CreateLecturerDto) { return this.lecturers.create(dto); }

  @Patch(':IDGV')
  update(@Param('IDGV') id: string, @Body() dto: UpdateLecturerDto) { return this.lecturers.update(id, dto); }

  @Delete(':IDGV')
  delete(@Param('IDGV') id: string) { return this.lecturers.delete(id); }
}
