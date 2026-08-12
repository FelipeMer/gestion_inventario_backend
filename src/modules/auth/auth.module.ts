import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule],
})
export class AuthModule {}