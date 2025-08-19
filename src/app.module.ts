import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsuariosInternosModule } from './usuarios-internos/usuarios-internos.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { ArchivosModule } from './archivos/archivos.module';



@Module({
  imports: [AuthModule, UsuariosInternosModule, RolesModule, PermisosModule, ClientesModule, ProyectosModule, TareasModule, ArchivosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
