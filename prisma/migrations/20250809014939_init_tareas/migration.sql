-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA');

-- CreateTable
CREATE TABLE "tareas" (
    "idTarea" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'PENDIENTE',
    "fechaLimite" TIMESTAMP(3),
    "idProyecto" TEXT NOT NULL,
    "idUsuarioResponsable" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("idTarea")
);

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyecto"("idProyecto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_idUsuarioResponsable_fkey" FOREIGN KEY ("idUsuarioResponsable") REFERENCES "usuarios_internos"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;
