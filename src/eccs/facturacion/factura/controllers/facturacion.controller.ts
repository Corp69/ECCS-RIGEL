import { Body, Controller, Get, Post } from '@nestjs/common';
import { FacturacionService } from '../services/facturacion.service.js';
import { FacturacionDto } from '../dto/facturacion.dto.js';

@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get('usuarios')
  public getUsuarios() {
    return this.facturacionService.getUsuarios();
  }

  @Post('timbrarTest')
  public getTimbrarTest(@Body() dto: FacturacionDto) {
    return this.facturacionService.getTimbrarTest(dto);
  }
  @Post('timbrar')
  public getTimbrar(@Body() dto: FacturacionDto) {
    return this.facturacionService.getTimbrar(dto);
  }


}
