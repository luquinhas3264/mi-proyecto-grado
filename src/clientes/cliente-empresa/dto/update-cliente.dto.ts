import { IsString, IsEmail, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClienteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  razonSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rubro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

