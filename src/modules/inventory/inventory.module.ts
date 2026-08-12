import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventario } from './entities/inventario.entity';
import { Movimiento } from './entities/movimiento.entity';
import { TipoMovimiento } from './entities/tipo-movimiento.entity';
import { Referencia } from './entities/referencia.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { Usuario } from '../auth/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventario,
      Movimiento,
      TipoMovimiento,
      Referencia,
      Producto,
      Usuario,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [TypeOrmModule, InventoryService], // otros módulos van a llamar a InventoryService directamente
})
export class InventoryModule {}