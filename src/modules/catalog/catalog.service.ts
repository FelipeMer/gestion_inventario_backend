import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from './entities/categoria.entity';
import { Cliente } from './entities/cliente.entity';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-producto.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  // ---------- PRODUCTOS ----------

  async createProduct(dto: CreateProductDto): Promise<Producto> {
    const categoria = await this.categoriaRepository.findOneBy({
      id_categoria: dto.categoria_id,
    });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const producto = this.productoRepository.create({
      ...dto,
      categoria,
    });
    return this.productoRepository.save(producto);
  }

  async findAllProducts(): Promise<Producto[]> {
    return this.productoRepository.find({ relations: { categoria: true } });
  }

  async findOneProduct(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id_producto: id },
      relations: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return producto;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Producto> {
    const producto = await this.findOneProduct(id);

    if (dto.categoria_id) {
      const categoria = await this.categoriaRepository.findOneBy({
        id_categoria: dto.categoria_id,
      });
      if (!categoria) throw new NotFoundException('Categoría no encontrada');
      producto.categoria = categoria;
    }

    Object.assign(producto, dto);
    return this.productoRepository.save(producto);
  }

  async removeProduct(id: string): Promise<void> {
    const producto = await this.findOneProduct(id);
    // Baja lógica en vez de DELETE físico — más seguro para un sistema de inventario
    producto.estado = false;
    await this.productoRepository.save(producto);
  }

  // ---------- CATEGORÍAS ----------

  async createCategoria(dto: CreateCategoriaDto): Promise<Categoria> {
    const categoria = this.categoriaRepository.create(dto);
    return this.categoriaRepository.save(categoria);
  }

  async findAllCategorias(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async findOneCategoria(id: string): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOneBy({
      id_categoria: id,
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return categoria;
  }

  async updateCategoria(id: string, dto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOneCategoria(id);
    Object.assign(categoria, dto);
    return this.categoriaRepository.save(categoria);
  }

  async removeCategoria(id: string): Promise<void> {
    const categoria = await this.findOneCategoria(id);
    categoria.estado = false;
    await this.categoriaRepository.save(categoria);
  }

  // ---------- CLIENTES ----------

  async createCliente(dto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clienteRepository.create(dto);
    return this.clienteRepository.save(cliente);
  }

  async findAllClientes(): Promise<Cliente[]> {
    return this.clienteRepository.find();
  }

  async findOneCliente(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOneBy({
      id_cliente: id,
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${id} no encontrado`);
    }
    return cliente;
  }

  async updateCliente(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOneCliente(id);
    Object.assign(cliente, dto);
    return this.clienteRepository.save(cliente);
  }

  async removeCliente(id: string): Promise<void> {
    const cliente = await this.findOneCliente(id);
    cliente.estado = false;
    await this.clienteRepository.save(cliente);
  }

  // ---------- PROVEEDORES ----------

  async createProveedor(dto: CreateProveedorDto): Promise<Proveedor> {
    const proveedor = this.proveedorRepository.create(dto);
    return this.proveedorRepository.save(proveedor);
  }

  async findAllProveedores(): Promise<Proveedor[]> {
    return this.proveedorRepository.find();
  }

  async findOneProveedor(id: string): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOneBy({
      id_proveedor: id,
    });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }
    return proveedor;
  }

  async updateProveedor(id: string, dto: UpdateProveedorDto): Promise<Proveedor> {
    const proveedor = await this.findOneProveedor(id);
    Object.assign(proveedor, dto);
    return this.proveedorRepository.save(proveedor);
  }

  async removeProveedor(id: string): Promise<void> {
    const proveedor = await this.findOneProveedor(id);
    proveedor.estado = false;
    await this.proveedorRepository.save(proveedor);
  }
}