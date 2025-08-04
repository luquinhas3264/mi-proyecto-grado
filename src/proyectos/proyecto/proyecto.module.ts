import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from 'src/clientes/actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],  
  providers: [ProyectoService],
  controllers: [ProyectoController]
})
export class ProyectoModule {}
