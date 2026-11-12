import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResponseDto } from '../../../../core/dtos/response.dto.js';

@Injectable()
export class FacturacionService {
  private readonly logger = new Logger(FacturacionService.name);

  constructor(private readonly dataSource: DataSource) {}

  public async getUsuarios(): Promise<ResponseDto<any>> {
    const titulo = 'ECCS - Modulo Facturacion - Usuarios.';

    try {
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

      return new ResponseDto(
        true,
        titulo,
        'Operacion realizada con exito.',
        data,
      );
    } catch (error) {
      this.logger.error(
        'Error al consultar usuarios de facturacion',
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        'Operación no se realizó',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
