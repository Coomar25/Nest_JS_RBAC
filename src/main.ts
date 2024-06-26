import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as basicAuth from 'express-basic-auth';
// import { CustomLogger } from 'utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // the console shows the logs from the CustomLogger
    //    {
    //   logger: new CustomLogger(),
    // }
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,UPDATE,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
    //Remember to set credentials: true if you're using cookies or other credentials in your requests. This allows the server to accept credentials from the client even when they're on different domains.
  });
  //swagger
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter());
  function getUnauthorizedResponse(req) {
    return req.auth
      ? 'Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected'
      : 'No credentials provided';
  }
  app.use(
    '/api*',
    basicAuth({
      unauthorizedResponse: getUnauthorizedResponse,
      challenge: true,
      realm: 'Imb4T3st4pp',
      users: {
        admin: 'supersecret',
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('Nest JS Role Based Auth API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        description: 'Enter your JWT token',
      },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    customSiteTitle: 'Nest JS Role Based Auth API',
    customfavIcon: 'https://www.swagger.com/favicon.ico',
    swaggerOptions: {
      persistAuthrization: true,
    },
  });
  await app.listen(4550);
}
bootstrap();
