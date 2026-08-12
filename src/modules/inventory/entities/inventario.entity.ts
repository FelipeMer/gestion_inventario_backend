import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from '../../catalog/entities/producto.entity';

@Entity('inventario')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id_inventario!: string;

  @OneToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column('int', { default: 0 })
  cantidad!: number;

  @Column({ nullable: true })
  ultimo_movimiento!: string;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;
}