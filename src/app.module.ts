import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfiguration, AppConfiguration } from './config/configuration';
import { ApplicationModule } from './application/application.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration],
    }),
    MongooseModule.forRootAsync({
      inject: [appConfiguration.KEY],
      useFactory: (config: AppConfiguration) => {
        return {
          uri: config.mongodb.uri,
          dbName: config.mongodb.dbName,
        };
      },
    }),
    // AutomapperModule.forRoot({
    //   options: [{ name: '', pluginInitializer: classes }],
    //   singular: true,
    // }),
    ApplicationModule,
  ],
})
export class AppModule {}
