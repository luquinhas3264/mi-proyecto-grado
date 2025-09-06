import { Module } from '@nestjs/common';
import { InteraccionClienteController } from './interaccion-cliente.controller';
import { InteraccionClienteService } from './interaccion-cliente.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],
  controllers: [InteraccionClienteController],
  providers: [InteraccionClienteService]
})
export class InteraccionClienteModule {}
