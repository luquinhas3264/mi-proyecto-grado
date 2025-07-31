import { Module } from '@nestjs/common';
import { ContactoClienteService } from './contacto-cliente.service';
import { ContactoClienteController } from './contacto-cliente.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from '../actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],
  providers: [ContactoClienteService],
  controllers: [ContactoClienteController]
})
export class ContactoClienteModule {}
