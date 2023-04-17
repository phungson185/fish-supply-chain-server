import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/exception.filter';
import { AppConfiguration, appConfiguration } from './config/configuration';

const globalPrefix = '/api';
const configureSwagger = (app: INestApplication) => {
  const appConfig = app.get<AppConfiguration>(appConfiguration.KEY);
  const baseApis = '/' + appConfig.baseUrl + globalPrefix;
  const baseUrl = baseApis.replace('//', '/');
  const swaggerDocOptions = new DocumentBuilder()
    .setTitle('Fish Supply Chain API')
    .setDescription('API for Fish Supply Chain')
    .setVersion('1.0.0')
    .addServer(baseUrl)
    .setBasePath(baseUrl)
    .addBearerAuth(
      {
        type: 'apiKey',
        scheme: 'JWT',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Type into the text box: Bearer {your JWT token}',
        in: 'header',
      },
      'JWT',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerDocOptions, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('docs', app, swaggerDoc);
};

const configureValidation = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get<AppConfiguration>(appConfiguration.KEY);
  app.setGlobalPrefix(globalPrefix);
  if (appConfig.isOpenSwagger) {
    configureSwagger(app);
  }
  configureValidation(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  const server = await app.listen(appConfig.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  server.setTimeout(1800000);
};
bootstrap();
