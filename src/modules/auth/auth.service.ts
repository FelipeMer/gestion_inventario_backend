import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<Usuario, 'password'>> {
    const existente = await this.usuarioRepository.findOneBy({ email: dto.email });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    let rol: Rol | null;
    if (dto.rol_id) {
      rol = await this.rolRepository.findOneBy({ id_rol: dto.rol_id });
      if (!rol) throw new NotFoundException('Rol no encontrado');
    } else {
      // Rol por defecto — ver nota abajo sobre sembrar roles primero
      rol = await this.rolRepository.findOneBy({ nombre: 'VENDEDOR' });
      if (!rol) {
        throw new NotFoundException(
          "No existe un rol por defecto 'VENDEDOR'. Créalo primero o especifica rol_id.",
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: passwordHash,
      rol,
    });

    const guardado = await this.usuarioRepository.save(usuario);
    return guardado; // el @Exclude() en la entity oculta el password gracias al ClassSerializerInterceptor
  }
}