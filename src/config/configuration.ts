import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => {
  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    baseUrl: process.env.BASE_URL_APIS || '',
    isOpenSwagger: process.env.IS_OPEN_SWAGGER === 'true',
    mongodb: {
      uri: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DBNAME,
    },
    jwt: {
      secret: process.env.SECRET_KEY || 'secret-key',
      signOptions: process.env.SIGN_OPTIONS || '4h',
    },
    web3: {
      httpUrl: process.env.WEB3_HTTP_URL,
    },
  };
});

export type AppConfiguration = ConfigType<typeof appConfiguration>;
export const InjectAppConfig = () => Inject(appConfiguration.KEY);
