import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Inventario } from './entities/inventario.entity';
import { Movimiento } from './entities/movimiento.entity';
import { TipoMovimiento } from './entities/tipo-movimiento.entity';
import { Referencia } from './entities/referencia.entity';
import { Producto } from '../catalog/entities/producto.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { CreateAjusteDto } from './dto/create-ajuste.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(TipoMovimiento)
    private readonly tipoMovimientoRepository: Repository<TipoMovimiento>,
    @InjectRepository(Referencia)
    private readonly referenciaRepository: Repository<Referencia>,
  ) {}

  // ---------- TIPOS DE MOVIMIENTO (datos semilla) ----------

  async createTipoMovimiento(dto: CreateTipoMovimientoDto): Promise<TipoMovimiento> {
    const existente = await this.tipoMovimientoRepository.findOneBy({ nombre: dto.nombre });
    if (existente) {
      throw new BadRequestException(`El tipo de movimiento '${dto.nombre}' ya existe`);
    }
    const tipo = this.tipoMovimientoRepository.create(dto);
    return this.tipoMovimientoRepository.save(tipo);
  }

  async findAllTiposMovimiento(): Promise<TipoMovimiento[]> {
    return this.tipoMovimientoRepository.find();
  }

  // ---------- MÉTODO CENTRAL DEL LEDGER ----------

  /**
   * Registra un movimiento (entrada/salida/ajuste) y actualiza el stock del producto.
   *
   * El parámetro `manager` es opcional: cuando purchases/sales llamen a este método
   * DESDE DENTRO de su propia transacción (queryRunner.manager), se lo pasan aquí
   * para que todos (crear entrada + movimiento + actualizar stock) se confirme o
   * se revierta como una sola unidad. Si no se pasa, usa los repositorios normales.
   */
  async registrarMovimiento(
    dto: RegistrarMovimientoDto,
    manager?: EntityManager,
  ): Promise<Movimiento> {
    const referenciaRepo = manager ? manager.getRepository(Referencia) : this.referenciaRepository;
    const movimientoRepo = manager ? manager.getRepository(Movimiento) : this.movimientoRepository;
    const tipoMovimientoRepo = manager
      ? manager.getRepository(TipoMovimiento)
      : this.tipoMovimientoRepository;
    const inventarioRepo = manager ? manager.getRepository(Inventario) : this.inventarioRepository;

    const tipoMovimiento = await tipoMovimientoRepo.findOneBy({
      id_tipo_movimiento: dto.tipo_movimiento_id,
    });
    if (!tipoMovimiento) {
      throw new NotFoundException('Tipo de movimiento no encontrado');
    }

    // 1. Crear la referencia (apunta a la entrada/salida/ajuste que originó esto)
    const referencia = referenciaRepo.create({
      tipo_referencia: dto.tipo_referencia,
      numero_referencia: dto.numero_referencia,
    });
    await referenciaRepo.save(referencia);

    // 2. Crear el movimiento
    const movimiento = movimientoRepo.create({
      producto: { id_producto: dto.producto_id } as Producto,
      tipoMovimiento,
      referencia,
      cantidad: dto.cantidad,
      usuario: { id_usuario: dto.usuario_id } as Usuario,
      observaciones: dto.observaciones,
    });
    await movimientoRepo.save(movimiento);

    // 3. Actualizar (o crear) el stock en inventario, aplicando el signo del tipo de movimiento
    await this.actualizarStock(
      dto.producto_id,
      dto.cantidad * tipoMovimiento.signo,
      inventarioRepo,
    );

    return movimiento;
  }

  /**
   * Suma o resta `delta` (puede ser negativo) al stock actual del producto.
   * Si el producto todavía no tiene fila en inventario, la crea con cantidad 0 primero.
   */
  private async actualizarStock(
    productoId: string,
    delta: number,
    inventarioRepo: Repository<Inventario>,
  ): Promise<Inventario> {
    let inventario = await inventarioRepo.findOne({
      where: { producto: { id_producto: productoId } },
      relations: { producto: true },
    });

    inventario ??= inventarioRepo.create({
        producto: { id_producto: productoId } as Producto,
        cantidad: 0,
    });

    const nuevaCantidad = inventario.cantidad + delta;
    if (nuevaCantidad < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${inventario.cantidad}, solicitado: ${-delta}`,
      );
    }

    inventario.cantidad = nuevaCantidad;
    inventario.ultimo_movimiento = delta > 0 ? 'ENTRADA' : 'SALIDA';
    return inventarioRepo.save(inventario);
  }

  // ---------- AJUSTES MANUALES (endpoint público) ----------

  async crearAjuste(dto: CreateAjusteDto, tipo: 'INCREMENTO' | 'DECREMENTO'): Promise<Movimiento> {
    const tipoMovimiento = await this.tipoMovimientoRepository.findOneBy({ nombre: 'AJUSTE' });
    if (!tipoMovimiento) {
      throw new NotFoundException(
        "Tipo de movimiento 'AJUSTE' no existe. Créalo primero vía POST /inventory/tipos-movimiento",
      );
    }

    // Un ajuste manual usa su propio signo según si es incremento o decremento del conteo físico
    const cantidadFinal = tipo === 'DECREMENTO' ? -dto.cantidad : dto.cantidad;

    return this.registrarMovimiento({
      producto_id: dto.producto_id,
      tipo_movimiento_id: tipoMovimiento.id_tipo_movimiento,
      cantidad: Math.abs(cantidadFinal),
      tipo_referencia: 'AJUSTE',
      numero_referencia: `AJUSTE-MANUAL-${Date.now()}`,
      usuario_id: dto.usuario_id,
      observaciones: dto.observaciones,
    });
  }

  // ---------- CONSULTAS ----------

  async findAllStock(): Promise<Inventario[]> {
    return this.inventarioRepository.find({ relations: { producto: true } });
  }

  async findStockByProducto(productoId: string): Promise<Inventario> {
    const inventario = await this.inventarioRepository.findOne({
      where: { producto: { id_producto: productoId } },
      relations: { producto: true },
    });
    if (!inventario) {
      throw new NotFoundException(`No hay inventario registrado para el producto ${productoId}`);
    }
    return inventario;
  }

  async findMovimientos(productoId?: string): Promise<Movimiento[]> {
    return this.movimientoRepository.find({
      where: productoId ? { producto: { id_producto: productoId } } : {},
      relations: { producto: true, tipoMovimiento: true, usuario: true, referencia: true },
      order: { fecha: 'DESC' },
    });
  }
}