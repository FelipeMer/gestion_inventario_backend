import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Salida } from './salida.entity';
import { Producto } from '../../catalog/entities/producto.entity';

@Entity('salida_detalle')
export class SalidaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id_salida_detalle!: string;

  @ManyToOne(() => Salida, (salida) => salida.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salida_id' })
  salida!: Salida;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column('int')
  cantidad!: number;

  @Column('numeric', { precision: 10, scale: 2 })
  precio_venta!: number;

  @Column('numeric', { precision: 10, scale: 2 })
  subtotal!: number;
}