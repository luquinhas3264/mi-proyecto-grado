import { Module } from '@nestjs/common';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],
  controllers: [TareaController],
  providers: [TareaService]
})
export class TareaModule {}
