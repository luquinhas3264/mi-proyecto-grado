import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsuariosInternosController } from './usuarios-internos.controller';
import { UsuariosInternosService } from './usuarios-internos.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosInternosController],
  providers: [UsuariosInternosService],
})
export class UsuariosInternosModule {}
