import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ required: true })
  @IsEmail()
  correo: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  contraseña: string;
}
