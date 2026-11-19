import {
  BadGatewayException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

/** Forma comun de las respuestas del PAC. En error, `data` viene vacio. */
export interface RespuestaFacturalo<T = string> {
  code: string;
  message: string;
  data: T;
}

/** En cualquier operacion: API KEY invalido o inexistente. */
const CODIGO_APIKEY_INVALIDO = '300';

// El PAC es Facturalo, pero el servicio que ve el cliente es ECCS.
const logger = new Logger('ECCS');

/** Quita el nombre del PAC de cualquier texto que pueda llegar al cliente. */
function aMarcaEccs(texto: string): string {
  return texto.replace(/facturalo\s*plus|facturalo/gi, 'ECCS').trim();
}

/**
 * El PAC reporta sus errores dentro del JSON (con HTTP 200), asi que hay
 * que revisar `code`. Lanza una excepcion de Nest si no es un codigo de exito;
 * la atrapa el GlobalExceptionFilter.
 *
 * @param respuesta Lo que devolvio ClientHttp.
 * @param exito     Codigos de exito de la operacion (timbrado: ['200'],
 *                  cancelacion: ['201', '202'], etc.).
 * @param contexto  Texto para el log/mensaje, ej. 'el timbrado'.
 */
export function validarRespuestaFacturalo<T>(
  respuesta: RespuestaFacturalo<T>,
  exito: string[],
  contexto: string,
): void {
  // ClientHttp devuelve texto plano si la respuesta no era JSON.
  if (typeof respuesta !== 'object' || respuesta === null) {
    logger.error(`Respuesta no valida del PAC en ${contexto}.`);
    throw new BadGatewayException('ECCS devolvió una respuesta inválida.');
  }

  const code = String(respuesta.code);
  if (exito.includes(code)) {
    return;
  }

  const mensaje = aMarcaEccs(String(respuesta.message));

  logger.warn(`ECCS rechazo ${contexto} (code ${code}): ${mensaje}`);

  // 300: el apikey enviado al PAC no es valido. No es error del
  // comprobante del cliente, es de credenciales/configuracion.
  if (code === CODIGO_APIKEY_INVALIDO) {
    throw new BadGatewayException('No se pudo autenticar con ECCS.');
  }

  // Rechazo de negocio (fecha vencida, timbre previo, CSD revocado, etc.).
  throw new BadRequestException(`ECCS rechazó ${contexto} (${code}): ${mensaje}`);
}
