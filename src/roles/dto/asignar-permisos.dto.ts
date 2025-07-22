import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarPermisosDto {
  @ApiProperty({
    example: ['uuid_permiso_1', 'uuid_permiso_2'],
  })
  @IsArray()
  @IsString({ each: true })
  permisosIds: string[];
}
