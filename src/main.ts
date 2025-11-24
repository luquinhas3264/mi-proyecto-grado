import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Servir archivos estáticos desde /uploads/proyectos
  const express = require('express');
  const { join } = require('path');
  app.use(
    '/uploads/proyectos',
    express.static(join(process.cwd(), 'uploads/proyectos')),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión - API')
    .setDescription('API para gestión de clientes y proyectos')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Ingresa tu token JWT',
    })
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Usuarios Internos', 'Gestión de usuarios del sistema')
    .addTag('Roles', 'Gestión de roles')
    .addTag('Permisos', 'Gestión de permisos')
    .addTag('Clientes', 'Gestión de clientes empresa')
    .addTag('Contactos', 'Gestión de contactos de clientes')
    .addTag('Etiquetas', 'Gestión de etiquetas')
    .addTag('Interacciones', 'Gestión de interacciones con clientes')
    .addTag('Proyectos', 'Gestión de proyectos')
    .addTag('Notas de Proyecto', 'Notas asociadas a proyectos')
    .addTag(
      'Actividades',
      'Actividades asociadas a usuarios, clientes y proyectos',
    )
    .addTag('Tareas', 'Gestión de tareas por proyecto')
    .addTag('Archivos', 'Gestión de archivos asociados a proyectos')
    .addTag('Dashboard', 'Dashboard del sistema')
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api`);
}
bootstrap();
