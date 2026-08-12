import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id_rol!: string;

  @Column({ unique: true })
  nombre!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios!: Usuario[];
}