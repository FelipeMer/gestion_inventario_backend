import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Producto } from './entities/producto.entity';
import { Categoria } from './entities/categoria.entity';
import { Cliente } from './entities/cliente.entity';
import { Proveedor } from './entities/proveedor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria, Cliente, Proveedor]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [TypeOrmModule], // permite que otros módulos inyecten estos repositorios
})
export class CatalogModule {}