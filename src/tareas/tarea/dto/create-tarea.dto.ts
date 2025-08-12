import { IsNotEmpty, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTareaDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  idProyecto: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsUUID()
  idUsuarioResponsable?: string;
}