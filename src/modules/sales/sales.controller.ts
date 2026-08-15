import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalidaDto } from './dto/create-salida.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('salidas')
  createSalida(@Body() dto: CreateSalidaDto) {
    return this.salesService.createSalida(dto);
  }

  @Get('salidas')
  findAllSalidas() {
    return this.salesService.findAllSalidas();
  }

  @Get('salidas/:id')
  findOneSalida(@Param('id') id: string) {
    return this.salesService.findOneSalida(id);
  }
}