import { IsUUID, IsNotEmpty, IsInt, IsPositive, IsString, IsOptional } from 'class-validator';

export class RegistrarMovimientoDto {
  @IsUUID()
  @IsNotEmpty()
  producto_id!: string;

  @IsUUID()
  @IsNotEmpty()
  tipo_movimiento_id!: string;

  @IsInt()
  @IsPositive()
  cantidad!: number; // siempre positivo, el signo del tipo_movimiento decide si suma o resta

  @IsString()
  @IsNotEmpty()
  tipo_referencia!: string; // 'ENTRADA' | 'SALIDA' | 'AJUSTE'

  @IsString()
  @IsNotEmpty()
  numero_referencia!: string; // id_entrada, id_salida, o un identificador manual

  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}