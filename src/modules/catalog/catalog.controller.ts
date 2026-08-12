import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-producto.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ---- Productos ----
  @Post('productos')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Get('productos')
  findAllProducts() {
    return this.catalogService.findAllProducts();
  }

  @Get('productos/:id')
  findOneProduct(@Param('id') id: string) {
    return this.catalogService.findOneProduct(id);
  }

  @Patch('productos/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete('productos/:id')
  removeProduct(@Param('id') id: string) {
    return this.catalogService.removeProduct(id);
  }

  // ---- Categorías ----
  @Post('categorias')
  createCategoria(@Body() dto: CreateCategoriaDto) {
  return this.catalogService.createCategoria(dto);
}

  @Get('categorias')
  findAllCategorias() {
    return this.catalogService.findAllCategorias();
  }

  // ---- Clientes ----
  @Post('clientes')
  createCliente(@Body() data: any) {
    return this.catalogService.createCliente(data);
  }

  @Get('clientes')
  findAllClientes() {
    return this.catalogService.findAllClientes();
  }

  // ---- Proveedores ----
  @Post('proveedores')
  createProveedor(@Body() data: any) {
    return this.catalogService.createProveedor(data);
  }

  @Get('proveedores')
  findAllProveedores() {
    return this.catalogService.findAllProveedores();
  }
}