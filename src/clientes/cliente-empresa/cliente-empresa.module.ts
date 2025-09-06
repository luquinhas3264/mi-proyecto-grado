import { Module } from '@nestjs/common';
import { ClienteEmpresaController } from './cliente-empresa.controller';
import { ClienteEmpresaService } from './cliente-empresa.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadesModule } from 'src/actividades/actividades.module';

@Module({
  imports: [PrismaModule, ActividadesModule],
  controllers: [ClienteEmpresaController],
  providers: [ClienteEmpresaService]
})
export class ClienteEmpresaModule {}
