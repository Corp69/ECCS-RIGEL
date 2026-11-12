import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CancelacionesService } from './cancelaciones.service.js';
import { CreateCancelacioneDto } from './dto/create-cancelacione.dto.js';
import { UpdateCancelacioneDto } from './dto/update-cancelacione.dto.js';

@Controller('cancelaciones')
export class CancelacionesController {
  constructor(private readonly cancelacionesService: CancelacionesService) {}

  @Post()
  create(@Body() createCancelacioneDto: CreateCancelacioneDto) {
    return this.cancelacionesService.create(createCancelacioneDto);
  }

  @Get()
  findAll() {
    return this.cancelacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cancelacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCancelacioneDto: UpdateCancelacioneDto) {
    return this.cancelacionesService.update(+id, updateCancelacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cancelacionesService.remove(+id);
  }
}
