import { Module } from '@nestjs/common';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActividadModule } from 'src/clientes/actividad/actividad.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';

@Module({
  imports: [PrismaModule, ActividadModule, MulterModule.register(multerConfig)],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService]
})
export class ArchivoModule {}
