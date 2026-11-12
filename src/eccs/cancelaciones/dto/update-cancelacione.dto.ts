import { PartialType } from '@nestjs/mapped-types';
import { CreateCancelacioneDto } from './create-cancelacione.dto.js';

export class UpdateCancelacioneDto extends PartialType(CreateCancelacioneDto) {}
