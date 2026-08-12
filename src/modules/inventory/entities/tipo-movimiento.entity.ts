import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_movimiento')
export class TipoMovimiento {
  @PrimaryGeneratedColumn('uuid')
  id_tipo_movimiento!: string;

  @Column({ unique: true })
  nombre!: string; // ej: 'ENTRADA', 'SALIDA', 'AJUSTE'

  @Column('int')
  signo!: number; // +1 o -1, define si suma o resta en el ledger

  @Column({ nullable: true })
  descripcion!: string;
}