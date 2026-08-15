import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-producto.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

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

  @Get('categorias/:id')
  findOneCategoria(@Param('id') id: string) {
    return this.catalogService.findOneCategoria(id);
  }

  @Patch('categorias/:id')
  updateCategoria(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.catalogService.updateCategoria(id, dto);
  }

  @Delete('categorias/:id')
  removeCategoria(@Param('id') id: string) {
    return this.catalogService.removeCategoria(id);
  }

  // ---- Clientes ----
  @Post('clientes')
  createCliente(@Body() dto: CreateClienteDto) {
    return this.catalogService.createCliente(dto);
  }

  @Get('clientes')
  findAllClientes() {
    return this.catalogService.findAllClientes();
  }

  @Get('clientes/:id')
  findOneCliente(@Param('id') id: string) {
    return this.catalogService.findOneCliente(id);
  }

  @Patch('clientes/:id')
  updateCliente(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.catalogService.updateCliente(id, dto);
  }

  @Delete('clientes/:id')
  removeCliente(@Param('id') id: string) {
    return this.catalogService.removeCliente(id);
  }

  // ---- Proveedores ----
    @Post('proveedores')
  createProveedor(@Body() dto: CreateProveedorDto) {
    return this.catalogService.createProveedor(dto);
  }

  @Get('proveedores')
  findAllProveedores() {
    return this.catalogService.findAllProveedores();
  }

  @Get('proveedores/:id')
  findOneProveedor(@Param('id') id: string) {
    return this.catalogService.findOneProveedor(id);
  }

  @Patch('proveedores/:id')
  updateProveedor(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
    return this.catalogService.updateProveedor(id, dto);
  }

  @Delete('proveedores/:id')
  removeProveedor(@Param('id') id: string) {
    return this.catalogService.removeProveedor(id);
  }
}