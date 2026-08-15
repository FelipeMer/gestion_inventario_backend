import { IsUUID, IsNotEmpty, IsInt, IsPositive, IsNumber } from 'class-validator';

export class CreateSalidaDetalleDto {
  @IsUUID()
  @IsNotEmpty()
  producto_id!: string;

  @IsInt()
  @IsPositive()
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio_venta!: number;
}