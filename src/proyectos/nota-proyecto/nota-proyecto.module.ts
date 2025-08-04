import { Module } from '@nestjs/common';
import { NotaProyectoController } from './nota-proyecto.controller';
import { NotaProyectoService } from './nota-proyecto.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from 'src/clientes/actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],
  controllers: [NotaProyectoController],
  providers: [NotaProyectoService]
})
export class NotaProyectoModule {}
