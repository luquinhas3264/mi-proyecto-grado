import { IsString, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactoDto {
  @ApiProperty({ required: true })
  @IsString()
  nombre: string;

  @ApiProperty({ required: true })
  @IsString()
  cargo: string;

  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  telefono: string;

  @ApiProperty({ required: true })
  @IsUUID()
  idCliente: string;
}
