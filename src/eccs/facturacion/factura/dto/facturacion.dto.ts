import { IsNotEmpty, IsString } from "class-validator";

export class FacturacionDto {

    @IsNotEmpty({ message: 'El api_key es obligatorio.' })
    @IsString({ message: 'El api_key debe ser texto.' })
    api_key: string;

    @IsNotEmpty({ message: 'El usuario es obligatorio.' })
    @IsString({ message: 'El usuario debe ser texto.' })
    usuario: string;

    /** Comprobante (JSON) en base64 que se va a timbrar. */
    @IsNotEmpty({ message: 'El comprobante (jsonB64) es obligatorio.' })
    @IsString({ message: 'El comprobante (jsonB64) debe ser texto en base64.' })
    jsonB64: string;

}
