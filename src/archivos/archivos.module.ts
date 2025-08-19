import { Module } from '@nestjs/common';
import { ArchivoModule } from './archivo/archivo.module';

@Module({
  imports: [ArchivoModule]
})
export class ArchivosModule {}
