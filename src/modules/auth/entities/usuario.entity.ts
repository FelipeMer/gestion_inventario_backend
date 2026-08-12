import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rol } from './rol.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_usuario!: string;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude() // evita que el hash del password salga en las respuestas JSON
  @Column()
  password!: string;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;

  @Column({ default: true })
  estado!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;
}