import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ResponseDto } from '../../../../core/dtos/response.dto.js';
import { FacturacionDto } from '../dto/facturacion.dto.js';
import { ValidacionUsuarioRow } from '../interfaces/validacion-usuario.interface.js';
import { UrlFacturalo } from '../interfaces/url-facturalo.interface.js';
import { DescuentoCreditoRow } from '../interfaces/descuento-credito.interface.js';
import { ClientHttp } from '../../../../core/http/client-http.service.js';
import {
  RespuestaFacturalo,
  validarRespuestaFacturalo,
} from '../../../../core/http/facturalo-response.js';

const CODIGO_TIMBRADO_OK = '200';

@Injectable()
export class FacturacionService {
  private readonly logger = new Logger(FacturacionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly clientHttp: ClientHttp,
    private readonly configService: ConfigService,
  ) {}

  public async getTimbrarTest( dto: FacturacionDto): Promise<ResponseDto<any>> {
    const titulo = 'ECCS - Modulo Facturacion - Timbrar.';

    // Sin try/catch: cualquier error lo atrapa GlobalExceptionFilter.
    // Los valores van como parametros ($1, $2), nunca dentro del texto del SQL.
    const data: ValidacionUsuarioRow[] = await this.dataSource.query(
      `select facturalo.fn_get_validacion_usuario($1, $2)`,
      [dto.api_key, dto.usuario],
    );

     //informacion de user
    const cuenta = data[0].fn_get_validacion_usuario.data;

    //if del correo - si tiene enviamos correo de alerta o no. 
    const url: UrlFacturalo[] = await this.dataSource.query(
      `select valor from eccs_facturalo_url where id = 1`
    );

    //http creamos la peticion a facturalo
    let timbrado: RespuestaFacturalo;
    try {
      timbrado = await this.clientHttp.httpPostFormEncoded<RespuestaFacturalo>(url[0].valor, {
        apikey:     dto.api_key,
        jsonB64:    dto.jsonB64,
        keyPEM:     cuenta.key,
        cerPEM:     cuenta.cer,
        plantilla:  '1',
      });
    } catch (error) {
      // Se registra con contexto, sin body ni llaves (son datos sensibles).
      this.logger.error(
        `Fallo el timbrado en Facturalo para el usuario ${cuenta.usuario}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Las excepciones de Nest (502/504 de ClientHttp) pasan tal cual.
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException('No se pudo timbrar en Facturalo.');
    }

    // Solo "200" es exito en timbrado (el helper lanza el error si no).
    validarRespuestaFacturalo(timbrado, [CODIGO_TIMBRADO_OK], 'el timbrado');

    const creditosRestantes = await this.descontarCredito(dto, cuenta.usuario);

    return new ResponseDto(true, titulo, 'Operacion realizada con exito.', {
      timbrado,
      creditos_restantes: creditosRestantes,
    });

  }
 
  public async getTimbrar( dto: FacturacionDto): Promise<ResponseDto<any>> {
    const titulo = 'ECCS - Modulo Facturacion - Timbrar.';

    // Sin try/catch: cualquier error lo atrapa GlobalExceptionFilter.
    // Los valores van como parametros ($1, $2), nunca dentro del texto del SQL.
    const data: ValidacionUsuarioRow[] = await this.dataSource.query(
      `select facturalo.fn_get_validacion_usuario($1, $2)`,
      [dto.api_key, dto.usuario],
    );

     //informacion de user
    const cuenta = data[0].fn_get_validacion_usuario.data;

    //if del correo - si tiene enviamos correo de alerta o no. 
    const url: UrlFacturalo[] = await this.dataSource.query(
      `select valor from eccs_facturalo_url where id = 2`
    );

    //http creamos la peticion a facturalo
    let timbrado: RespuestaFacturalo;
    try {
      timbrado = await this.clientHttp.httpPostFormEncoded<RespuestaFacturalo>(url[0].valor, {
        apikey:     dto.api_key,
        jsonB64:    dto.jsonB64,
        keyPEM:     cuenta.key,
        cerPEM:     cuenta.cer,
        plantilla:  '1',
      });
    } catch (error) {
      // Se registra con contexto, sin body ni llaves (son datos sensibles).
      this.logger.error(
        `Fallo el timbrado en Facturalo para el usuario ${cuenta.usuario}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Las excepciones de Nest (502/504 de ClientHttp) pasan tal cual.
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException('No se pudo timbrar en Facturalo.');
    }

    // Solo "200" es exito en timbrado (el helper lanza el error si no).
    validarRespuestaFacturalo(timbrado, [CODIGO_TIMBRADO_OK], 'el timbrado');

    // Timbre exitoso: se descuenta el credito.
    // Si el descuento falla NO se lanza error: el CFDI ya esta timbrado y el
    // cliente debe recibirlo. Se registra para conciliar el credito a mano.
    const creditosRestantes = await this.descontarCredito(dto, cuenta.usuario);

    return new ResponseDto(true, titulo, 'Operacion realizada con exito.', {
      timbrado,
      creditos_restantes: creditosRestantes,
    });

  }

  /**
   * Descuenta un credito tras un timbrado exitoso.
   * NO lanza error si falla: el CFDI ya esta timbrado y el cliente debe
   * recibirlo. Se registra en el log para conciliar el credito a mano.
   * @returns los creditos restantes, o undefined si no se pudo descontar.
   */
  private async descontarCredito(
    dto: FacturacionDto,
    usuario: string,
  ): Promise<number | undefined> {
    try {
      const descuento: DescuentoCreditoRow[] = await this.dataSource.query(
        `select facturalo.fn_get_timbre_correcto($1, $2) as descuento`,
        [dto.api_key, dto.usuario],
      );

      const resultado = descuento[0]?.descuento;
      if (resultado?.success) {
        return resultado.creditos_restantes;
      }

      this.logger.error(
        `Timbrado exitoso pero la funcion no descontó el credito del usuario ${usuario}: ${resultado?.mensaje ?? 'sin respuesta'}`,
      );
    } catch (error) {
      this.logger.error(
        `Timbrado exitoso pero NO se pudo descontar el credito del usuario ${usuario}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return undefined;
  }

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
