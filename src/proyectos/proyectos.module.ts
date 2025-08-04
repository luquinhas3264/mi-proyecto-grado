import { Module } from '@nestjs/common';
import { ProyectoModule } from './proyecto/proyecto.module';
import { NotaProyectoModule } from './nota-proyecto/nota-proyecto.module';

@Module({
  imports: [ProyectoModule, NotaProyectoModule]
})
export class ProyectosModule {}
