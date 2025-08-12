import { Module } from '@nestjs/common';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from 'src/clientes/actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],
  controllers: [TareaController],
  providers: [TareaService]
})
export class TareaModule {}
