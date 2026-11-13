import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type FormBody = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Cliente HTTP genérico. Recibe la URL completa y el body.
 * Los errores se lanzan como excepciones de Nest para que los atrape
 * el GlobalExceptionFilter.
 */
@Injectable()
export class ClientHttp {
  private readonly logger = new Logger(ClientHttp.name);
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.timeoutMs = Number(
      this.configService.get<string>('HTTP_TIMEOUT') ?? 30000,
    );
  }

  /** POST con body JSON. */
  public httpPost<T = any>(url: string, body: unknown): Promise<T> {
    return this.request<T>('POST', url, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  }

  /** POST con body application/x-www-form-urlencoded (ej. Facturalo). */
  public httpPostFormEncoded<T = any>(url: string, body: FormBody): Promise<T> {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        form.set(key, String(value));
      }
    }

    return this.request<T>('POST', url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  }

  /** GET. */
  public httpGet<T = any>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    url: string,
    init: { headers?: Record<string, string>; body?: string } = {},
  ): Promise<T> {
    // Se registra solo origen + ruta: el query y el body pueden traer secretos.
    const target = this.safeTarget(url);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: init.headers,
        body: init.body,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError');
      this.logger.error(
        `${method} ${target} fallo de conexion${isTimeout ? ' (timeout)' : ''}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (isTimeout) {
        throw new GatewayTimeoutException('El servicio externo no respondió a tiempo.');
      }
      throw new BadGatewayException('No se pudo conectar con el servicio externo.');
    }

    const raw = await response.text();

    if (!response.ok) {
      // El detalle se queda en el log; al cliente solo le llega el status.
      this.logger.error(`${method} ${target} respondió ${response.status}: ${raw}`);
      throw new BadGatewayException(
        `El servicio externo respondió con error (${response.status}).`,
      );
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  private safeTarget(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      throw new BadGatewayException('URL del servicio externo inválida.');
    }
  }
}
