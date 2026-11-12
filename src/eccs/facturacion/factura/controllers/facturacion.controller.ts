import { Controller, Get } from '@nestjs/common';
import { FacturacionService } from '../services/facturacion.service.js';

@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get('usuarios')
  getUsuarios() {
    return this.facturacionService.getUsuarios();
  }
}
