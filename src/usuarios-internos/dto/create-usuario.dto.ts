import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ required: true })
  @IsString()
  nombre: string;

  @ApiProperty({ required: true })
  @IsEmail()
  correo: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  contraseña: string;

  @ApiProperty({ required: true })
  @IsString()
  idRol: string;
}
