import { IsUUID, IsNotEmpty, IsInt, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreateAjusteDto {
  @IsUUID()
  @IsNotEmpty()
  producto_id!: string;

  @IsInt()
  @IsPositive()
  cantidad!: number;

  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}