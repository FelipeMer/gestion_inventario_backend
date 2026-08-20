import { UseGuards, Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { CreateAjusteDto } from './dto/create-ajuste.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ---- Tipos de movimiento (setup inicial) ----
  @Post('tipos-movimiento')
  createTipoMovimiento(@Body() dto: CreateTipoMovimientoDto) {
    return this.inventoryService.createTipoMovimiento(dto);
  }

  @Get('tipos-movimiento')
  findAllTiposMovimiento() {
    return this.inventoryService.findAllTiposMovimiento();
  }

  // ---- Stock ----
  @Get()
  findAllStock() {
    return this.inventoryService.findAllStock();
  }

  @Get(':productoId')
  findStockByProducto(@Param('productoId') productoId: string) {
    return this.inventoryService.findStockByProducto(productoId);
  }

  // ---- Movimientos (historial) ----
  @Get('movimientos/historial')
  findMovimientos(@Query('productoId') productoId?: string) {
    return this.inventoryService.findMovimientos(productoId);
  }

  // ---- Ajustes manuales ----
  @Post('ajustes/incremento')
  crearAjusteIncremento(@Body() dto: CreateAjusteDto) {
    return this.inventoryService.crearAjuste(dto, 'INCREMENTO');
  }

  @Post('ajustes/decremento')
  crearAjusteDecremento(@Body() dto: CreateAjusteDto) {
    return this.inventoryService.crearAjuste(dto, 'DECREMENTO');
  }
}