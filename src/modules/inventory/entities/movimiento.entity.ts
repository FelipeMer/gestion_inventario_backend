import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TipoMovimiento } from './tipo-movimiento.entity';
import { Referencia } from './referencia.entity';
import { Producto } from '../../catalog/entities/producto.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn('uuid')
  id_movimiento!: string;

  @ManyToOne(() => TipoMovimiento)
  @JoinColumn({ name: 'tipo_movimiento_id' })
  tipoMovimiento!: TipoMovimiento;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @ManyToOne(() => Referencia)
  @JoinColumn({ name: 'referencia_id' })
  referencia!: Referencia; // apunta a entrada o salida según referencia.tipo_referencia

  @Column('int')
  cantidad!: number;

  @CreateDateColumn()
  fecha!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ nullable: true })
  observaciones!: string;
}