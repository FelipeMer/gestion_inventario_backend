import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Entrada } from './entities/entrada.entity';
import { EntradaDetalle } from './entities/entrada-detalle.entity';
import { Proveedor } from '../catalog/entities/proveedor.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { TipoMovimiento } from '../inventory/entities/tipo-movimiento.entity';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Entrada)
    private readonly entradaRepository: Repository<Entrada>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async createEntrada(dto: CreateEntradaDto): Promise<Entrada> {
    const proveedor = await this.proveedorRepository.findOneBy({
      id_proveedor: dto.proveedor_id,
    });
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const tipoMovimiento = await this.dataSource
      .getRepository(TipoMovimiento)
      .findOneBy({ nombre: 'ENTRADA' });
    if (!tipoMovimiento) {
      throw new NotFoundException(
        "Tipo de movimiento 'ENTRADA' no existe. Créalo primero vía POST /inventory/tipos-movimiento",
      );
    }

    // queryRunner: nos permite agrupar TODOs lo siguiente en una sola transacción.
    // Si algo falla a mitad de camino (ej. stock queda negativo por algún error),
    // se revierte TODOs — no queda una entrada "a medias" en la base de datos.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const total = dto.detalles.reduce(
        (sum, d) => sum + d.cantidad * d.precio_compra,
        0,
      );

      // 1. Crear la entrada (cabecera)
      const entrada = queryRunner.manager.create(Entrada, {
        proveedor,
        usuario: { id_usuario: dto.usuario_id } as Usuario,
        observaciones: dto.observaciones,
        total,
      });
      await queryRunner.manager.save(entrada);

      // 2. Crear cada detalle
      const detalles: EntradaDetalle[] = [];
      for (const item of dto.detalles) {
        const producto = await queryRunner.manager.findOneBy(Producto, {
          id_producto: item.producto_id,
        });
        if (!producto) {
          throw new NotFoundException(`Producto ${item.producto_id} no encontrado`);
        }

        const detalle = queryRunner.manager.create(EntradaDetalle, {
          entrada,
          producto,
          cantidad: item.cantidad,
          precio_compra: item.precio_compra,
          subtotal: item.cantidad * item.precio_compra,
        });
        await queryRunner.manager.save(detalle);
        detalles.push(detalle);

        // 3. Por cada detalle, registrar el movimiento y sumar al stock
        //    Le pasamos queryRunner.manager para que quede DENTRO de esta misma transacción
        await this.inventoryService.registrarMovimiento(
          {
            producto_id: item.producto_id,
            tipo_movimiento_id: tipoMovimiento.id_tipo_movimiento,
            cantidad: item.cantidad,
            tipo_referencia: 'ENTRADA',
            numero_referencia: entrada.id_entrada,
            usuario_id: dto.usuario_id,
            observaciones: `Entrada #${entrada.id_entrada}`,
          },
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();

      entrada.detalles = detalles;
      return entrada;
    } catch (error) {
      // Si algo falló, deshacemos absolutamente todos lo que se intentó guardar arriba
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Esto SIEMPRE se ejecuta, haya éxito o error — libera la conexión
      await queryRunner.release();
    }
  }

  async findAllEntradas(): Promise<Entrada[]> {
    return this.entradaRepository.find({
      relations: { proveedor: true, usuario: true, detalles: { producto: true } },
      order: { fecha: 'DESC' },
    });
  }

  async findOneEntrada(id: string): Promise<Entrada> {
    const entrada = await this.entradaRepository.findOne({
      where: { id_entrada: id },
      relations: { proveedor: true, usuario: true, detalles: { producto: true } },
    });
    if (!entrada) {
      throw new NotFoundException(`Entrada ${id} no encontrada`);
    }
    return entrada;
  }
}