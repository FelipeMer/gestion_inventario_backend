import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id_cliente!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  telefono!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ default: true })
  estado!: boolean;
}