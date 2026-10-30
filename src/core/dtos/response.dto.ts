export class ResponseDto<T = unknown> {
  constructor(
    public readonly success: boolean,
    public readonly titulo: string,
    public readonly mensaje: string,
    public readonly response: T,
  ) {}
}
