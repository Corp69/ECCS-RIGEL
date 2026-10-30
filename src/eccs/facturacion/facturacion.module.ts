import { Module } from '@nestjs/common';
import { FacturacionService } from './factura/services/facturacion.service.js';
import { FacturacionController } from './factura/controllers/facturacion.controller.js';

@Module({
  controllers: [FacturacionController],
  providers: [FacturacionService],
})
export class FacturacionModule {}
