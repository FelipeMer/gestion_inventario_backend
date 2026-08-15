import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntradaDetalleDto } from './create-entrada-detalle.dto';

export class CreateEntradaDto {
  @IsUUID()
  @IsNotEmpty()
  proveedor_id!: string;

  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEntradaDetalleDto)
  detalles!: CreateEntradaDetalleDto[];
}