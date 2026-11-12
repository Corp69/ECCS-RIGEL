import { Module } from '@nestjs/common';
import { CancelacionesService } from './cancelaciones.service.js';
import { CancelacionesController } from './cancelaciones.controller.js';

@Module({
  controllers: [CancelacionesController],
  providers: [CancelacionesService],
})
export class CancelacionesModule {}
