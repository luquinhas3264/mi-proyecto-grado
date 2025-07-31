-- CreateTable
CREATE TABLE "cliente_empresa" (
    "idCliente" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cliente_empresa_pkey" PRIMARY KEY ("idCliente")
);

-- CreateTable
CREATE TABLE "contacto_cliente" (
    "idContacto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "idCliente" TEXT NOT NULL,

    CONSTRAINT "contacto_cliente_pkey" PRIMARY KEY ("idContacto")
);

-- CreateTable
CREATE TABLE "etiqueta_cliente" (
    "idEtiqueta" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "etiqueta_cliente_pkey" PRIMARY KEY ("idEtiqueta")
);

-- CreateTable
CREATE TABLE "cliente_etiqueta" (
    "idCliente" TEXT NOT NULL,
    "idEtiqueta" TEXT NOT NULL,

    CONSTRAINT "cliente_etiqueta_pkey" PRIMARY KEY ("idCliente","idEtiqueta")
);

-- CreateTable
CREATE TABLE "interaccion_cliente" (
    "idInteraccion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "idContacto" TEXT NOT NULL,

    CONSTRAINT "interaccion_cliente_pkey" PRIMARY KEY ("idInteraccion")
);

-- CreateTable
CREATE TABLE "actividad" (
    "idActividad" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "idCliente" TEXT NOT NULL,
    "idProyecto" TEXT,

    CONSTRAINT "actividad_pkey" PRIMARY KEY ("idActividad")
);

-- CreateTable
CREATE TABLE "proyecto" (
    "idProyecto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "idCliente" TEXT NOT NULL,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("idProyecto")
);

-- CreateIndex
CREATE UNIQUE INDEX "etiqueta_cliente_nombre_key" ON "etiqueta_cliente"("nombre");

-- AddForeignKey
ALTER TABLE "contacto_cliente" ADD CONSTRAINT "contacto_cliente_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "cliente_empresa"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_etiqueta" ADD CONSTRAINT "cliente_etiqueta_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "cliente_empresa"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_etiqueta" ADD CONSTRAINT "cliente_etiqueta_idEtiqueta_fkey" FOREIGN KEY ("idEtiqueta") REFERENCES "etiqueta_cliente"("idEtiqueta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaccion_cliente" ADD CONSTRAINT "interaccion_cliente_idContacto_fkey" FOREIGN KEY ("idContacto") REFERENCES "contacto_cliente"("idContacto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios_internos"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "cliente_empresa"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyecto"("idProyecto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "cliente_empresa"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;
