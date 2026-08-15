import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Salida } from './entities/salida.entity';
import { SalidaDetalle } from './entities/salida-detalle.entity';
import { Cliente } from '../catalog/entities/cliente.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { TipoMovimiento } from '../inventory/entities/tipo-movimiento.entity';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Salida)
    private readonly salidaRepository: Repository<Salida>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async createSalida(dto: CreateSalidaDto): Promise<Salida> {
    const cliente = await this.clienteRepository.findOneBy({
      id_cliente: dto.cliente_id,
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const tipoMovimiento = await this.dataSource
      .getRepository(TipoMovimiento)
      .findOneBy({ nombre: 'SALIDA' });
    if (!tipoMovimiento) {
      throw new NotFoundException(
        "Tipo de movimiento 'SALIDA' no existe. Créalo primero vía POST /inventory/tipos-movimiento",
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const total = dto.detalles.reduce(
        (sum, d) => sum + d.cantidad * d.precio_venta,
        0,
      );

      // 1. Crear la salida (cabecera)
      const salida = queryRunner.manager.create(Salida, {
        cliente,
        usuario: { id_usuario: dto.usuario_id } as Usuario,
        observaciones: dto.observaciones,
        total,
      });
      await queryRunner.manager.save(salida);

      // 2. Crear cada detalle
      const detalles: SalidaDetalle[] = [];
      for (const item of dto.detalles) {
        const producto = await queryRunner.manager.findOneBy(Producto, {
          id_producto: item.producto_id,
        });
        if (!producto) {
          throw new NotFoundException(`Producto ${item.producto_id} no encontrado`);
        }

        const detalle = queryRunner.manager.create(SalidaDetalle, {
          salida,
          producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
          subtotal: item.cantidad * item.precio_venta,
        });
        await queryRunner.manager.save(detalle);
        detalles.push(detalle);

        // 3. Registrar el movimiento — aquí, si no hay stock suficiente,
        //    registrarMovimiento() lanza BadRequestException y todos se revierte
        await this.inventoryService.registrarMovimiento(
          {
            producto_id: item.producto_id,
            tipo_movimiento_id: tipoMovimiento.id_tipo_movimiento,
            cantidad: item.cantidad,
            tipo_referencia: 'SALIDA',
            numero_referencia: salida.id_salida,
            usuario_id: dto.usuario_id,
            observaciones: `Salida #${salida.id_salida}`,
          },
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();

      salida.detalles = detalles;
      return salida;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllSalidas(): Promise<Salida[]> {
    return this.salidaRepository.find({
      relations: { cliente: true, usuario: true, detalles: { producto: true } },
      order: { fecha: 'DESC' },
    });
  }

  async findOneSalida(id: string): Promise<Salida> {
    const salida = await this.salidaRepository.findOne({
      where: { id_salida: id },
      relations: { cliente: true, usuario: true, detalles: { producto: true } },
    });
    if (!salida) {
      throw new NotFoundException(`Salida ${id} no encontrada`);
    }
    return salida;
  }
}