import { Module } from '@nestjs/common';
import { NotaProyectoController } from './nota-proyecto.controller';
import { NotaProyectoService } from './nota-proyecto.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],
  controllers: [NotaProyectoController],
  providers: [NotaProyectoService]
})
export class NotaProyectoModule {}
