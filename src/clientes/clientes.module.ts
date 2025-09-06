import { Module } from '@nestjs/common';
import { ClienteEmpresaModule } from './cliente-empresa/cliente-empresa.module';
import { ContactoClienteModule } from './contacto-cliente/contacto-cliente.module';
import { EtiquetaClienteModule } from './etiqueta-cliente/etiqueta-cliente.module';
import { InteraccionClienteModule } from './interaccion-cliente/interaccion-cliente.module';

@Module({
  imports: [ClienteEmpresaModule, ContactoClienteModule, EtiquetaClienteModule, InteraccionClienteModule]
})
export class ClientesModule {}
