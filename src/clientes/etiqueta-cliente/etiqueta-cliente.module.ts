import { Module } from '@nestjs/common';
import { EtiquetaClienteService } from './etiqueta-cliente.service';
import { EtiquetaClienteController } from './etiqueta-cliente.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EtiquetaClienteService],
  controllers: [EtiquetaClienteController]
})
export class EtiquetaClienteModule {}
