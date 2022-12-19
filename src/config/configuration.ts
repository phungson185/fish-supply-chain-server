import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { v2 } from 'cloudinary';


export const appConfiguration = registerAs('app', () => {
  return {
    port: parseInt(process.env.NFT_PORT, 10) || 3000,
    baseUrl: process.env.BASE_URL_APIS || '',
    apiHeroEmpires: process.env.HERO_EMPIRES_BASE_URL,
    heroesEmpireTokenUrl: process.env.HERO_EMPIRES_GET_TOKEN_INFO_URL,
    marketplaceOwnerAddress: process.env.MARKETPLACE_OWNER_ADDRESS,
    ownerPrivateKey: process.env.NFT_MINTER_PRIVATE_KEY,
    syncAllEnabled: process.env.SYNC_ALL_ENABLED === 'true',
    validatorAddress: process.env.VALIDATOR_ADDRESS,
    validatorPrivateKey: process.env.VALIDATOR_PRIVATE_KEY,
    isOpenSwagger: process.env.IS_OPEN_SWAGGER === 'true',
    mongodb: {
      uri: process.env.NFT_MONGODB_URI,
      dbName: process.env.NFT_MONGODB_DBNAME,
    },
    jwt: {
      secret: process.env.NFT_SECRET_KEY || 'secret-key',
      signOptions: process.env.NFT_SIGN_OPTIONS || '4h',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    apiIdleCyber: {
      url: process.env.IDLE_CYBER_URL,
      urlMetaData: process.env.IDLE_CYBER_META_DATA_URL,
      apiKey: process.env.IDLE_CYBER_API_KEY,
      whitelistIP: process.env.IDLE_CYBER_WHITELIST_IP || '::1',
    },
    web3: {
      httpUrl: process.env.WEB3_HTTP_URL,
    },
    rabbitMQ: {
      url: process.env.RABBITMQ_URL,
      heartbeat: Number(process.env.RABBITMQ_HEART_BEAT) || 60,
    },
    isMintingEnabled: process.env.IS_MINTING_ENABLED === 'true',
    referPercent: Number(process.env.REFER_PERCENT) || 0,
  };
});

export const cloudinaryConfig = v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type AppConfiguration = ConfigType<typeof appConfiguration>;
export const InjectAppConfig = () => Inject(appConfiguration.KEY);
