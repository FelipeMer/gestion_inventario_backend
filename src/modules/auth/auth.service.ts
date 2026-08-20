import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<Usuario, 'password'>> {
    // ... tu código actual de register() se queda exactamente igual, sin cambios
    const existente = await this.usuarioRepository.findOneBy({ email: dto.email });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    let rol: Rol | null;
    if (dto.rol_id) {
      rol = await this.rolRepository.findOneBy({ id_rol: dto.rol_id });
      if (!rol) throw new NotFoundException('Rol no encontrado');
    } else {
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

    return this.usuarioRepository.save(usuario);
  }

  // ---------- NUEVO ----------
  async login(dto: LoginDto): Promise<{ access_token: string; usuario: Omit<Usuario, 'password'> }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: dto.email },
      relations: { rol: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return { access_token, usuario };
  }
}