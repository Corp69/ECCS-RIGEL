import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResponseDto } from '../../../../core/dtos/response.dto.js';

@Injectable()
export class FacturacionService {
  constructor(private readonly dataSource: DataSource) {}

  public async getUsuarios(): Promise<ResponseDto<any>> {
    const titulo = 'ECCS - Modulo Facturacion - Usuarios.';

    // Sin try/catch: cualquier error lo atrapa GlobalExceptionFilter.
    const data = await this.dataSource.query(
      `
      select
          eccs_facturalo.razonsocial,
          eccs_facturalo.correo,
          eccs_estatus.descripcion as estatus,
          eccs_facturalo.rfc,
          eccs_facturalo.creditos,
          eccs_facturalo.alerta_creditos,
          eccs_facturalo.telefono
      from eccs_facturalo
      inner join eccs_estatus on eccs_estatus.id = eccs_facturalo.id_eccs_estatus
      `,
    );

    return new ResponseDto(true, titulo, 'Operacion realizada con exito.', data);
  }
}
