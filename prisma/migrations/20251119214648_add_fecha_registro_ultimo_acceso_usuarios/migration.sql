-- AlterTable
ALTER TABLE "usuarios_internos" ADD COLUMN     "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ultimoAcceso" TIMESTAMP(3);
