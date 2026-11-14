import {
  BadGatewayException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

/** Forma comun de las respuestas de Facturalo. En error, `data` viene vacio. */
export interface RespuestaFacturalo<T = string> {
  code: string;
  message: string;
  data: T;
}

/** En cualquier operacion: API KEY invalido o inexistente. */
const CODIGO_APIKEY_INVALIDO = '300';

const logger = new Logger('Facturalo');

/**
 * Facturalo reporta sus errores dentro del JSON (con HTTP 200), asi que hay
 * que revisar `code`. Lanza una excepcion de Nest si no es un codigo de exito;
 * la atrapa el GlobalExceptionFilter.
 *
 * @param respuesta Lo que devolvio ClientHttp.
 * @param exito     Codigos de exito de la operacion (timbrado: ['200'],
 *                  cancelacion: ['201', '202'], etc.).
 * @param contexto  Texto para el log/mensaje, ej. 'timbrado' o 'cancelacion'.
 */
export function validarRespuestaFacturalo<T>(
  respuesta: RespuestaFacturalo<T>,
  exito: string[],
  contexto: string,
): void {
  // ClientHttp devuelve texto plano si la respuesta no era JSON.
  if (typeof respuesta !== 'object' || respuesta === null) {
    logger.error(`Respuesta no valida de Facturalo en ${contexto}.`);
    throw new BadGatewayException('Facturalo devolvió una respuesta inválida.');
  }

  const code = String(respuesta.code);
  if (exito.includes(code)) {
    return;
  }

  logger.warn(
    `Facturalo rechazo ${contexto} (code ${code}): ${respuesta.message}`,
  );

  // 300: el apikey enviado a Facturalo no es valido. No es error del
  // comprobante del cliente, es de credenciales/configuracion.
  if (code === CODIGO_APIKEY_INVALIDO) {
    throw new BadGatewayException('No se pudo autenticar con Facturalo.');
  }

  throw new BadRequestException(
    `Facturalo rechazó ${contexto} (${code}): ${String(respuesta.message).trim()}`,
  );
}
