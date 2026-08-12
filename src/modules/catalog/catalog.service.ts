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
    return this.productoRepository.find({ relations: {'categoria': true} });
  }

  async findOneProduct(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id_producto: id },
      relations: {'categoria': true},
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
    const categoria = this.categoriaRepository.create({
        ...dto
    });
    return this.categoriaRepository.save(categoria);
  }

  async findAllCategorias(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  // ---------- CLIENTES ----------

  async createCliente(data: Partial<Cliente>): Promise<Cliente> {
    const cliente = this.clienteRepository.create(data);
    return this.clienteRepository.save(cliente);
  }

  async findAllClientes(): Promise<Cliente[]> {
    return this.clienteRepository.find();
  }

  // ---------- PROVEEDORES ----------

  async createProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    const proveedor = this.proveedorRepository.create(data);
    return this.proveedorRepository.save(proveedor);
  }

  async findAllProveedores(): Promise<Proveedor[]> {
    return this.proveedorRepository.find();
  }
}