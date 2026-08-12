import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('referencias')
export class Referencia {
  @PrimaryGeneratedColumn('uuid')
  id_referencia!: string;

  @Column()
  tipo_referencia!: string; // 'ENTRADA' | 'SALIDA'

  @Column()
  numero_referencia!: string; // guarda el id_entrada o id_salida correspondiente

  @Column({ nullable: true })
  descripcion!: string;
}