import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id_categoria!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @Column({ default: true })
  estado!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos!: Producto[];
}