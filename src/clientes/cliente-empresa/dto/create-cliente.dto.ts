import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @ApiProperty({ required: true })
  @IsString()
  rubro: string;

  @ApiProperty({ required: true })
  @IsEmail()
  correo: string;

  @ApiProperty({ required: true })
  @IsString()
  telefono: string;

  @ApiProperty({ required: true })
  @IsString()
  direccion: string;
}
