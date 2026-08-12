import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Salida } from './entities/salida.entity';
import { SalidaDetalle } from './entities/salida-detalle.entity';
import { Cliente } from '../catalog/entities/cliente.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salida, SalidaDetalle, Cliente, Producto, Usuario]),
    InventoryModule, // necesario para poder inyectar InventoryService en sales.service.ts
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}