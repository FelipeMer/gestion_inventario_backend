import { IsString, IsNotEmpty, IsEmail, MinLength, IsUUID, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsUUID()
  @IsOptional()
  rol_id?: string; // si no se manda, asignamos un rol por defecto (ver nota abajo)
}