/*
  Warnings:

  - The `estado` column on the `proyecto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `actualizadoEn` to the `proyecto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('PLANEADO', 'EN_PROGRESO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "descripcion" DROP NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoProyecto" NOT NULL DEFAULT 'PLANEADO',
ALTER COLUMN "fechaFin" DROP NOT NULL;

-- CreateTable
CREATE TABLE "nota_proyecto" (
    "idNota" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idProyecto" TEXT NOT NULL,

    CONSTRAINT "nota_proyecto_pkey" PRIMARY KEY ("idNota")
);

-- AddForeignKey
ALTER TABLE "nota_proyecto" ADD CONSTRAINT "nota_proyecto_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyecto"("idProyecto") ON DELETE RESTRICT ON UPDATE CASCADE;
