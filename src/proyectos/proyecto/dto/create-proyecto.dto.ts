import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProyectoDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: true })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  idCliente: string;
}
