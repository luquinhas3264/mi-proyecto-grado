import { Module } from '@nestjs/common';
import { ContactoClienteService } from './contacto-cliente.service';
import { ContactoClienteController } from './contacto-cliente.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],
  providers: [ContactoClienteService],
  controllers: [ContactoClienteController]
})
export class ContactoClienteModule {}
