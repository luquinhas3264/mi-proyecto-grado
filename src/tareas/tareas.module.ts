import { Module } from '@nestjs/common';
import { TareaModule } from './tarea/tarea.module';

@Module({
  imports: [TareaModule]
})
export class TareasModule {}
