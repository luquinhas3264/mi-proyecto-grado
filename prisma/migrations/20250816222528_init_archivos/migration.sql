-- CreateTable
CREATE TABLE "archivo" (
    "idArchivo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamaño" INTEGER,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "idProyecto" TEXT NOT NULL,
    "idUsuarioCreador" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("idArchivo")
);

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyecto"("idProyecto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "usuarios_internos"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
