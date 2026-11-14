/** Valor JSON que devuelve facturalo.fn_get_timbre_correcto. */
export interface DescuentoCredito {
  success: boolean;
  mensaje: string;
  creditos_restantes: number;
}

/** Fila de: select facturalo.fn_get_timbre_correcto($1, $2) as descuento */
export interface DescuentoCreditoRow {
  descuento: DescuentoCredito;
}
