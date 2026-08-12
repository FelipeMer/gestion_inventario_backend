// entrada-detalle.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Entrada } from './entrada.entity';
import { Producto } from '../../catalog/entities/producto.entity';

@Entity('entrada_detalle')
export class EntradaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id_entrada_detalle!: string;

  @ManyToOne(() => Entrada, (entrada) => entrada.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entrada_id' })
  entrada!: Entrada;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column('int')
  cantidad!: number;

  @Column('numeric', { precision: 10, scale: 2 })
  precio_compra!: number;

  @Column('numeric', { precision: 10, scale: 2 })
  subtotal!: number;
}