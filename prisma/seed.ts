import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed inicial...');

  // 1. Lista de permisos base
  const permisosBase = [
    { modulo: 'usuarios', accion: 'ver' },
    { modulo: 'usuarios', accion: 'crear' },
    { modulo: 'usuarios', accion: 'editar' },    
    { modulo: 'roles', accion: 'ver' },
    { modulo: 'roles', accion: 'crear' },
    { modulo: 'roles', accion: 'editar' },
    { modulo: 'roles', accion: 'eliminar' },
    { modulo: 'roles', accion: 'editar-permisos' },
    { modulo: 'permisos', accion: 'ver' },
    { modulo: 'permisos', accion: 'crear' },
  ];

  console.log('📌 Creando permisos...');
  for (const permiso of permisosBase) {
    await prisma.permiso.upsert({
      where: {
        modulo_accion: {
          modulo: permiso.modulo,
          accion: permiso.accion,
        },
      },
      update: {},
      create: permiso,
    });
  }

  // 2. Crear rol admin
  console.log('👑 Creando rol "admin"...');
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador con todos los permisos',
    },
  });

  const todosLosPermisos = await prisma.permiso.findMany();

  console.log('🔗 Asociando permisos al rol admin...');
  for (const permiso of todosLosPermisos) {
    await prisma.rolPermiso.upsert({
      where: {
        idRol_idPermiso: {
          idRol: rolAdmin.idRol,
          idPermiso: permiso.idPermiso,
        },
      },
      update: {},
      create: {
        idRol: rolAdmin.idRol,
        idPermiso: permiso.idPermiso,
      },
    });
  }

  // 3. Crear usuario admin
  const adminEmail = 'admin@sistema.com';
  const adminPassword = 'admin123';

  console.log('🙋 Creando usuario admin...');
  const contraseñaHash = await bcrypt.hash(adminPassword, 10);

  await prisma.usuarioInterno.upsert({
    where: { correo: adminEmail },
    update: {},
    create: {
      nombre: 'Administrador del sistema',
      correo: adminEmail,
      contraseña: contraseñaHash,
      idRol: rolAdmin.idRol,
      activo: true,
    },
  });

  console.log('✅ Seed completado con éxito');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
