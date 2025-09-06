import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],  
  providers: [ProyectoService],
  controllers: [ProyectoController]
})
export class ProyectoModule {}
