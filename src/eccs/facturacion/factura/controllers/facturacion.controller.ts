import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacturacionService } from '../services/facturacion.service.js';

@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}


}
