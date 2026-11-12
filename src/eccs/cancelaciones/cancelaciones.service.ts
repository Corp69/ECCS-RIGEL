import { Injectable } from '@nestjs/common';
import { CreateCancelacioneDto } from './dto/create-cancelacione.dto.js';
import { UpdateCancelacioneDto } from './dto/update-cancelacione.dto.js';

@Injectable()
export class CancelacionesService {
  create(createCancelacioneDto: CreateCancelacioneDto) {
    return 'This action adds a new cancelacione';
  }

  findAll() {
    return `This action returns all cancelaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cancelacione`;
  }

  update(id: number, updateCancelacioneDto: UpdateCancelacioneDto) {
    return `This action updates a #${id} cancelacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} cancelacione`;
  }
}
