import { Module } from '@nestjs/common';
import { ClienteEmpresaController } from './cliente-empresa.controller';
import { ClienteEmpresaService } from './cliente-empresa.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from '../actividad/actividad.module';

@Module({
  imports: [PrismaModule, ActividadModule],
  controllers: [ClienteEmpresaController],
  providers: [ClienteEmpresaService]
})
export class ClienteEmpresaModule {}
