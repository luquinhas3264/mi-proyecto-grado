import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PreviewUrlDto {
  @ApiProperty({
    description: 'URL a previsualizar',
    example: 'https://drive.google.com/drive/folders/abc123xyz'
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  }, { message: 'Debe ser una URL válida con protocolo HTTP o HTTPS' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  url: string;
}