import { Module } from '@nestjs/common';
import { ClientHttp } from './client-http.service.js';

@Module({
  providers: [ClientHttp],
  exports: [ClientHttp],
})
export class ClientHttpModule {}
