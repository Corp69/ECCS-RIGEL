import { Injectable } from '@nestjs/common';
import { CreateFacturacionDto } from '../dto/create-facturacion.dto.js';

@Injectable()
export class FacturacionService {
  create(createFacturacionDto: CreateFacturacionDto) {
    return 'This action adds a new facturacion';
  }


}
