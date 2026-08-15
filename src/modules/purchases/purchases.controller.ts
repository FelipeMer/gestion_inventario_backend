import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('entradas')
  createEntrada(@Body() dto: CreateEntradaDto) {
    return this.purchasesService.createEntrada(dto);
  }

  @Get('entradas')
  findAllEntradas() {
    return this.purchasesService.findAllEntradas();
  }

  @Get('entradas/:id')
  findOneEntrada(@Param('id') id: string) {
    return this.purchasesService.findOneEntrada(id);
  }
}