import { Module } from '@nestjs/common';
import { FacturacionService } from './factura/services/facturacion.service.js';
import { FacturacionController } from './factura/controllers/facturacion.controller.js';
import { ClientHttpModule } from '../../core/http/client-http.module.js';

@Module({
  imports: [ClientHttpModule],
  controllers: [FacturacionController],
  providers: [FacturacionService],
})
export class FacturacionModule {}
