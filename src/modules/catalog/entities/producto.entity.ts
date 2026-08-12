import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Categoria } from './categoria.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id_producto!: string;

  @Column({ unique: true })
  codigo_barras!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;

  @Column({ nullable: true })
  marca!: string;

  @Column({ nullable: true })
  talla!: string;

  @Column({ nullable: true })
  color!: string;

  @Column('numeric', { precision: 10, scale: 2 })
  precio_compra!: number;

  @Column('numeric', { precision: 10, scale: 2 })
  precio_venta!: number;

  @Column('int', { default: 0 })
  stock_minimo!: number;

  @Column({ nullable: true })
  imagen!: string;

  @Column({ default: true })
  estado!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;
}