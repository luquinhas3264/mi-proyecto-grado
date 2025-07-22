import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PermisosController],
  providers: [PermisosService],
})
export class PermisosModule {}
