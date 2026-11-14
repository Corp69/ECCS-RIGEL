/** Contenido de `data` que devuelve facturalo.fn_get_validacion_usuario. */
export interface ValidacionUsuarioData {
  usuario: string;
  creditos_disponibles: number;
  enviar_alerta: boolean;

  cer: string;
  key: string;

}

/** Valor JSON que devuelve la función. */
export interface ValidacionUsuario {
  data: ValidacionUsuarioData;
}

/** Fila que regresa: select facturalo.fn_get_validacion_usuario($1, $2) */
export interface ValidacionUsuarioRow {
  fn_get_validacion_usuario: ValidacionUsuario;
}
