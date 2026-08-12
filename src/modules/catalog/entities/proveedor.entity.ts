import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id_proveedor!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  nit!: string;

  @Column({ nullable: true })
  telefono!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ default: true })
  estado!: boolean;
}