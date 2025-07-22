import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsuariosInternosModule } from './usuarios-internos/usuarios-internos.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';


@Module({
  imports: [AuthModule, UsuariosInternosModule, RolesModule, PermisosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
