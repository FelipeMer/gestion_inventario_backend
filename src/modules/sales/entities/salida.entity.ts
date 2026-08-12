import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Cliente } from '../../catalog/entities/cliente.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { SalidaDetalle } from './salida-detalle.entity';

@Entity('salidas')
export class Salida {
  @PrimaryGeneratedColumn('uuid')
  id_salida!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ nullable: true })
  observaciones!: string;

  @Column('numeric', { precision: 10, scale: 2 })
  total!: number;

  @OneToMany(() => SalidaDetalle, (detalle) => detalle.salida, { cascade: true })
  detalles!: SalidaDetalle[];
}