// entrada.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Proveedor } from '../../catalog/entities/proveedor.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { EntradaDetalle } from './entrada-detalle.entity';

@Entity('entradas')
export class Entrada {
  @PrimaryGeneratedColumn('uuid')
  id_entrada!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: Proveedor;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ nullable: true })
  observaciones!: string;

  @Column('numeric', { precision: 10, scale: 2 })
  total!: number;

  @OneToMany(() => EntradaDetalle, (detalle) => detalle.entrada, { cascade: true })
  detalles!: EntradaDetalle[];
}