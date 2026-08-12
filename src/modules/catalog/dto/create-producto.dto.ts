import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  codigo_barras!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  @IsNotEmpty()
  categoria_id!: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  talla?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio_compra!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio_venta!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_minimo?: number;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}