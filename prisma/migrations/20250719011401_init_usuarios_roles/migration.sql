-- CreateTable
CREATE TABLE "usuarios_internos" (
    "idUsuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "idRol" TEXT NOT NULL,

    CONSTRAINT "usuarios_internos_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "roles" (
    "idRol" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("idRol")
);

-- CreateTable
CREATE TABLE "permisos" (
    "idPermiso" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("idPermiso")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "idRol" TEXT NOT NULL,
    "idPermiso" TEXT NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("idRol","idPermiso")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_internos_correo_key" ON "usuarios_internos"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_modulo_accion_key" ON "permisos"("modulo", "accion");

-- AddForeignKey
ALTER TABLE "usuarios_internos" ADD CONSTRAINT "usuarios_internos_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "roles"("idRol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "roles"("idRol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_idPermiso_fkey" FOREIGN KEY ("idPermiso") REFERENCES "permisos"("idPermiso") ON DELETE RESTRICT ON UPDATE CASCADE;
