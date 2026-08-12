import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Entrada } from './entities/entrada.entity';
import { EntradaDetalle } from './entities/entrada-detalle.entity';
import { Proveedor } from '../catalog/entities/proveedor.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entrada, EntradaDetalle, Proveedor, Usuario, Producto]),
    InventoryModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}