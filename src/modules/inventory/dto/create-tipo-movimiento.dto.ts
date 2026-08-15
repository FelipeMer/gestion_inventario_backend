import { IsString, IsNotEmpty, IsInt, IsIn, IsOptional } from 'class-validator';

export class CreateTipoMovimientoDto {
  @IsString()
  @IsNotEmpty()
  nombre?: string; // 'ENTRADA' | 'SALIDA' | 'AJUSTE'

  @IsInt()
  @IsIn([1, -1])
  signo?: number; // +1 suma al inventario, -1 resta

  @IsString()
  @IsOptional()
  descripcion?: string;
}