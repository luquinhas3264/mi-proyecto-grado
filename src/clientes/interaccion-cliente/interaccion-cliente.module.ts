import { Module } from '@nestjs/common';
import { InteraccionClienteController } from './interaccion-cliente.controller';
import { InteraccionClienteService } from './interaccion-cliente.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from '../actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],
  controllers: [InteraccionClienteController],
  providers: [InteraccionClienteService]
})
export class InteraccionClienteModule {}
